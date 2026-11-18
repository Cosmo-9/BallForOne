import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, count, eq } from "drizzle-orm";
import { addTeam, deleteTournament } from "../../actions";
import { db, matches, players, teams, tournaments } from "@/db";
import Fixtures from "./fixtures";
import { isOrganizer } from "@/lib/auth";
import { formatLabel, sportOf } from "@/lib/options";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  "need-teams": "Add at least two teams before generating fixtures.",
  "fixtures-exist": "Fixtures already exist. Clear them first to regenerate.",
  "fixtures-played": "Some matches already have results, so fixtures can't be cleared.",
};

export default async function TournamentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const tournamentId = Number(id);
  if (!Number.isInteger(tournamentId) || tournamentId <= 0) notFound();

  const [tournament] = await db()
    .select()
    .from(tournaments)
    .where(eq(tournaments.id, tournamentId));
  if (!tournament) notFound();

  const [teamList, fixtures, organizer] = await Promise.all([
    db()
      .select({
        id: teams.id,
        name: teams.name,
        department: teams.department,
        playerCount: count(players.id),
      })
      .from(teams)
      .leftJoin(players, eq(players.teamId, teams.id))
      .where(eq(teams.tournamentId, tournamentId))
      .groupBy(teams.id)
      .orderBy(asc(teams.name)),
    db()
      .select()
      .from(matches)
      .where(eq(matches.tournamentId, tournamentId))
      .orderBy(asc(matches.round), asc(matches.id)),
    isOrganizer(),
  ]);

  const teamNames = new Map(teamList.map((t) => [t.id, t.name]));
  const errorMessage = error ? ERRORS[error] : undefined;

  const sport = sportOf(tournament.sport);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-slate-600 hover:underline">
        ← All tournaments
      </Link>

      <div className="card">
        <div className="text-3xl">{sport.icon}</div>
        <h1 className="mt-2 text-2xl font-extrabold">{tournament.name}</h1>
        <p className="text-slate-600">
          {sport.label} · {formatLabel(tournament.format)}
          {tournament.host ? ` · ${tournament.host}` : ""}
        </p>
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{errorMessage}</p>
      )}

      <Fixtures
        tournamentId={tournamentId}
        format={tournament.format}
        teamNames={teamNames}
        fixtures={fixtures}
        organizer={organizer}
      />

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Teams ({teamList.length})</h2>
        {teamList.length === 0 ? (
          <p className="text-slate-600">No teams yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {teamList.map((team) => (
              <li key={team.id}>
                <Link
                  href={`/tournaments/${tournamentId}/teams/${team.id}`}
                  className="card block hover:border-turf"
                >
                  <h3 className="font-bold">{team.name}</h3>
                  <p className="text-sm text-slate-600">
                    {team.department ? `${team.department} · ` : ""}
                    {team.playerCount} {team.playerCount === 1 ? "player" : "players"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {organizer && (
        <>
          <form action={addTeam} className="card space-y-3">
            <h2 className="font-bold">Add a team</h2>
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" required placeholder="Team name" className="input" />
              <input name="department" placeholder="Department (optional)" className="input" />
            </div>
            {error === "team" && <p className="text-sm text-red-600">Give the team a name.</p>}
            <button className="btn">Add team</button>
          </form>

          <form action={deleteTournament} className="text-right">
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <button className="btn-danger">Delete this tournament</button>
          </form>
        </>
      )}
    </div>
  );
}
