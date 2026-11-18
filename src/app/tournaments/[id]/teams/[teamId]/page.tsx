import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { addPlayer, deletePlayer, deleteTeam } from "../../../../actions";
import { db, players, teams, tournaments } from "@/db";
import { isOrganizer } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  player: "Give the player a name.",
  shirt: "Shirt number must be a whole number.",
};

export default async function TeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; teamId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, teamId: teamParam } = await params;
  const { error } = await searchParams;
  const tournamentId = Number(id);
  const teamId = Number(teamParam);
  if (!Number.isInteger(tournamentId) || !Number.isInteger(teamId)) notFound();

  const [row] = await db()
    .select({ team: teams, tournamentName: tournaments.name })
    .from(teams)
    .innerJoin(tournaments, eq(tournaments.id, teams.tournamentId))
    .where(and(eq(teams.id, teamId), eq(teams.tournamentId, tournamentId)));
  if (!row) notFound();

  const [roster, organizer] = await Promise.all([
    db()
      .select()
      .from(players)
      .where(eq(players.teamId, teamId))
      .orderBy(asc(players.shirtNumber), asc(players.name)),
    isOrganizer(),
  ]);

  return (
    <div className="space-y-6">
      <Link href={`/tournaments/${tournamentId}`} className="text-sm text-slate-600 hover:underline">
        ← {row.tournamentName}
      </Link>

      <div className="card">
        <h1 className="text-2xl font-extrabold">{row.team.name}</h1>
        {row.team.department && <p className="text-slate-600">{row.team.department}</p>}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Squad ({roster.length})</h2>
        {roster.length === 0 ? (
          <p className="text-slate-600">No players yet.</p>
        ) : (
          <ul className="card divide-y divide-slate-100 p-0">
            {roster.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-3">
                <span className="w-8 text-center text-lg font-extrabold text-turf">
                  {p.shirtNumber ?? "–"}
                </span>
                <div className="flex-1">
                  <div className="font-semibold">{p.name}</div>
                  {p.position && <div className="text-sm text-slate-600">{p.position}</div>}
                </div>
                {organizer && (
                  <form action={deletePlayer}>
                    <input type="hidden" name="tournamentId" value={tournamentId} />
                    <input type="hidden" name="teamId" value={teamId} />
                    <input type="hidden" name="playerId" value={p.id} />
                    <button className="btn-danger">Remove</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {organizer && (
        <>
          <form action={addPlayer} className="card space-y-3">
            <h2 className="font-bold">Add a player</h2>
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <input type="hidden" name="teamId" value={teamId} />
            <div className="grid gap-3 sm:grid-cols-3">
              <input name="name" required placeholder="Player name" className="input sm:col-span-1" />
              <input name="position" placeholder="Position (optional)" className="input" />
              <input name="shirtNumber" type="number" min={0} placeholder="Shirt no." className="input" />
            </div>
            {error && ERRORS[error] && <p className="text-sm text-red-600">{ERRORS[error]}</p>}
            <button className="btn">Add player</button>
          </form>

          <form action={deleteTeam} className="text-right">
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <input type="hidden" name="teamId" value={teamId} />
            <button className="btn-danger">Delete this team</button>
          </form>
        </>
      )}
    </div>
  );
}
