"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, matches, players, teams, tournaments } from "@/db";
import { knockoutFirstRound, roundRobin } from "@/lib/fixtures";
import {
  endSession,
  passwordIsCorrect,
  requireOrganizer,
  startSession,
} from "@/lib/auth";
import { FORMATS, SPORTS } from "@/lib/options";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function idField(formData: FormData, name: string) {
  const id = Number(field(formData, name));
  if (!Number.isInteger(id) || id <= 0) throw new Error(`Invalid ${name}`);
  return id;
}

// ---------- Sign in / out ----------

export async function login(formData: FormData) {
  if (!passwordIsCorrect(field(formData, "password"))) {
    redirect("/login?error=1");
  }
  await startSession();
  redirect("/");
}

export async function logout() {
  await endSession();
  redirect("/");
}

// ---------- Tournaments ----------

export async function createTournament(formData: FormData) {
  await requireOrganizer();
  const name = field(formData, "name");
  const sport = field(formData, "sport");
  const format = field(formData, "format");
  const host = field(formData, "host");

  if (!name) redirect("/tournaments/new?error=name");
  if (!SPORTS.some((s) => s.value === sport)) redirect("/tournaments/new?error=sport");
  if (!FORMATS.some((f) => f.value === format)) redirect("/tournaments/new?error=format");

  const [created] = await db()
    .insert(tournaments)
    .values({ name, sport, format, host: host || null })
    .returning({ id: tournaments.id });

  revalidatePath("/");
  redirect(`/tournaments/${created.id}`);
}

export async function deleteTournament(formData: FormData) {
  await requireOrganizer();
  const id = idField(formData, "tournamentId");
  await db().delete(tournaments).where(eq(tournaments.id, id));
  revalidatePath("/");
  redirect("/");
}

// ---------- Teams ----------

export async function addTeam(formData: FormData) {
  await requireOrganizer();
  const tournamentId = idField(formData, "tournamentId");
  const name = field(formData, "name");
  const department = field(formData, "department");
  if (!name) redirect(`/tournaments/${tournamentId}?error=team`);

  await db()
    .insert(teams)
    .values({ tournamentId, name, department: department || null });

  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function deleteTeam(formData: FormData) {
  await requireOrganizer();
  const tournamentId = idField(formData, "tournamentId");
  const teamId = idField(formData, "teamId");
  await db()
    .delete(teams)
    .where(and(eq(teams.id, teamId), eq(teams.tournamentId, tournamentId)));
  revalidatePath(`/tournaments/${tournamentId}`);
  redirect(`/tournaments/${tournamentId}`);
}

// ---------- Players ----------

export async function addPlayer(formData: FormData) {
  await requireOrganizer();
  const tournamentId = idField(formData, "tournamentId");
  const teamId = idField(formData, "teamId");
  const name = field(formData, "name");
  const position = field(formData, "position");
  const shirt = field(formData, "shirtNumber");
  const page = `/tournaments/${tournamentId}/teams/${teamId}`;

  if (!name) redirect(`${page}?error=player`);
  const shirtNumber = shirt ? Number(shirt) : null;
  if (shirtNumber !== null && (!Number.isInteger(shirtNumber) || shirtNumber < 0)) {
    redirect(`${page}?error=shirt`);
  }

  await db()
    .insert(players)
    .values({ teamId, name, position: position || null, shirtNumber });

  revalidatePath(page);
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function deletePlayer(formData: FormData) {
  await requireOrganizer();
  const tournamentId = idField(formData, "tournamentId");
  const teamId = idField(formData, "teamId");
  const playerId = idField(formData, "playerId");
  await db()
    .delete(players)
    .where(and(eq(players.id, playerId), eq(players.teamId, teamId)));
  revalidatePath(`/tournaments/${tournamentId}/teams/${teamId}`);
  revalidatePath(`/tournaments/${tournamentId}`);
}

// ---------- Fixtures ----------

export async function generateFixtures(formData: FormData) {
  await requireOrganizer();
  const tournamentId = idField(formData, "tournamentId");
  const page = `/tournaments/${tournamentId}`;

  const [tournament] = await db()
    .select()
    .from(tournaments)
    .where(eq(tournaments.id, tournamentId));
  if (!tournament) redirect("/");

  const existing = await db()
    .select({ id: matches.id })
    .from(matches)
    .where(eq(matches.tournamentId, tournamentId))
    .limit(1);
  if (existing.length > 0) redirect(`${page}?error=fixtures-exist`);

  const teamRows = await db()
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.tournamentId, tournamentId));
  if (teamRows.length < 2) redirect(`${page}?error=need-teams`);

  const ids = teamRows.map((t) => t.id);
  const pairings = tournament.format === "knockout" ? knockoutFirstRound(ids) : roundRobin(ids);

  await db()
    .insert(matches)
    .values(
      pairings.map((p) => ({
        tournamentId,
        round: p.round,
        homeTeamId: p.homeTeamId,
        awayTeamId: p.awayTeamId,
        status: p.awayTeamId === null ? "bye" : "upcoming",
      })),
    );

  revalidatePath(page);
  redirect(`${page}#fixtures`);
}

export async function clearFixtures(formData: FormData) {
  await requireOrganizer();
  const tournamentId = idField(formData, "tournamentId");
  const page = `/tournaments/${tournamentId}`;

  // Don't wipe fixtures once results have been entered.
  const played = await db()
    .select({ id: matches.id })
    .from(matches)
    .where(and(eq(matches.tournamentId, tournamentId), inArray(matches.status, ["live", "finished"])))
    .limit(1);
  if (played.length > 0) redirect(`${page}?error=fixtures-played`);

  await db().delete(matches).where(eq(matches.tournamentId, tournamentId));
  revalidatePath(page);
  redirect(`${page}#fixtures`);
}

export async function updateMatchDetails(formData: FormData) {
  await requireOrganizer();
  const tournamentId = idField(formData, "tournamentId");
  const matchId = idField(formData, "matchId");
  const when = field(formData, "scheduledAt"); // "2026-11-20T15:00" from the date picker
  const venue = field(formData, "venue");

  let scheduledAt: Date | null = null;
  if (when) {
    scheduledAt = new Date(`${when}:00Z`);
    if (Number.isNaN(scheduledAt.getTime())) scheduledAt = null;
  }

  await db()
    .update(matches)
    .set({ scheduledAt, venue: venue || null })
    .where(and(eq(matches.id, matchId), eq(matches.tournamentId, tournamentId)));

  revalidatePath(`/tournaments/${tournamentId}`);
}
