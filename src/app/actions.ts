"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, players, teams, tournaments } from "@/db";
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
