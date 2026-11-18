import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { addPlayer, deletePlayer, deleteTeam } from "../../../../actions";
import { db, players, teams, tournaments } from "@/db";
import { isOrganizer } from "@/lib/auth";
import { teamFaculty } from "@/lib/faculties";
import Crest from "@/components/crest";

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
    .select({ team: teams, tournamentName: tournaments.name, host: tournaments.host })
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

  const faculty = teamFaculty(row.team.department, row.host);

  return (
    <div className="flex flex-col gap-6">
      {faculty && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px]"
          style={{ background: `radial-gradient(800px 320px at 50% -60px, ${faculty.color}59 0%, ${faculty.color}1A 42%, transparent 75%)` }}
        />
      )}

      <Link href={`/tournaments/${tournamentId}?tab=teams`} className="flex items-center gap-3 text-sm font-semibold text-soft">
        <span className="btn-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </span>
        {row.tournamentName}
      </Link>

      <div className="flex items-center gap-4">
        <Crest name={row.team.name} faculty={faculty} size={72} />
        <div className="min-w-0">
          <h1 className="h-display text-[40px]">{row.team.name}</h1>
          {row.team.department && row.team.department !== row.team.name && (
            <p className="text-sm text-muted">{row.team.department}</p>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="h-display text-2xl">Squad ({roster.length})</h2>
        {roster.length === 0 ? (
          <p className="card text-muted">No players yet.</p>
        ) : (
          <ul className="surface divide-y divide-white/5 overflow-hidden rounded-2xl">
            {roster.map((p) => (
              <li key={p.id} className="flex min-h-16 items-center gap-4 px-4 py-3">
                <span className="w-9 text-center font-display text-3xl font-extrabold italic leading-none" style={{ color: faculty?.color ?? "#C8FF2E" }}>
                  {p.shirtNumber ?? "–"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{p.name}</div>
                  {p.position && <div className="text-xs text-muted">{p.position}</div>}
                </div>
                {organizer && (
                  <form action={deletePlayer}>
                    <input type="hidden" name="tournamentId" value={tournamentId} />
                    <input type="hidden" name="teamId" value={teamId} />
                    <input type="hidden" name="playerId" value={p.id} />
                    <button className="btn-danger" aria-label={`Remove ${p.name}`}>
                      Remove
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {organizer && (
        <>
          <form action={addPlayer} className="card flex flex-col gap-3">
            <h2 className="h-display text-xl">Add a player</h2>
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <input type="hidden" name="teamId" value={teamId} />
            <label className="sr-only" htmlFor="p-name">
              Player name
            </label>
            <input id="p-name" name="name" required placeholder="Player name" className="input" />
            <div className="grid grid-cols-[1fr_7rem] gap-3">
              <label className="sr-only" htmlFor="p-pos">
                Position
              </label>
              <input id="p-pos" name="position" placeholder="Position (optional)" className="input" />
              <label className="sr-only" htmlFor="p-num">
                Shirt number
              </label>
              <input id="p-num" name="shirtNumber" type="number" min={0} inputMode="numeric" placeholder="No." className="input" />
            </div>
            {error && ERRORS[error] && <p className="text-sm text-red-400">{ERRORS[error]}</p>}
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
