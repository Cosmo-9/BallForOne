import Link from "next/link";
import { addFacultyTeams, addTeam, deleteTournament } from "../../actions";
import { FACULTIES } from "@/lib/faculties";
import Crest from "@/components/crest";
import type { TeamInfo } from "./types";

type Props = {
  tournamentId: number;
  teams: TeamInfo[];
  organizer: boolean;
  hasFixtures: boolean;
};

export default function TeamsTab({ tournamentId, teams, organizer, hasFixtures }: Props) {
  const taken = new Set(teams.map((t) => t.name.toLowerCase()));
  const available = FACULTIES.filter((f) => !taken.has(f.name.toLowerCase()));
  const base = `/tournaments/${tournamentId}`;

  return (
    <section className="flex flex-col gap-6">
      {teams.length === 0 ? (
        <p className="card text-muted">No teams yet.</p>
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {teams.map((t) => (
            <li key={t.id}>
              <Link
                href={`${base}/teams/${t.id}`}
                className="surface flex min-h-16 items-center gap-3 rounded-2xl px-4 py-3 transition hover:border-white/20"
                style={
                  t.faculty
                    ? { background: `linear-gradient(120deg, ${t.faculty.color}24 0%, transparent 55%), linear-gradient(180deg, #141C2B 0%, #0D121D 100%)` }
                    : undefined
                }
              >
                <Crest name={t.name} faculty={t.faculty} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{t.name}</span>
                  <span className="block text-xs text-muted">
                    {t.department && t.department !== t.name ? `${t.department} · ` : ""}
                    {t.playerCount} {t.playerCount === 1 ? "player" : "players"}
                  </span>
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {organizer && (
        <>
          {available.length > 0 && (
            <form action={addFacultyTeams} className="flex flex-col gap-4">
              <input type="hidden" name="tournamentId" value={tournamentId} />
              <div>
                <h2 className="h-display text-2xl">Add faculty teams</h2>
                <p className="text-sm text-muted">Tap each faculty taking part, then add them all at once.</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {available.map((f) => (
                  <label
                    key={f.code}
                    className="choice min-h-16 items-center gap-2.5 px-3 py-2.5"
                    style={{ "--fac": f.color } as React.CSSProperties}
                  >
                    <input type="checkbox" name="faculty" value={f.code} className="peer sr-only" />
                    <Crest name={f.name} faculty={f} size={36} />
                    <span className="min-w-0 flex-1 text-[13px] font-semibold leading-tight">{f.name}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8FF2E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="hidden peer-checked:block" aria-hidden="true">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  </label>
                ))}
              </div>
              <button className="btn w-full">Add selected faculties</button>
            </form>
          )}

          <form action={addTeam} className="card flex flex-col gap-3">
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <div>
              <h2 className="h-display text-xl">Add a team by name</h2>
              <p className="text-sm text-muted">For departmental tournaments, or any team not listed above.</p>
            </div>
            <label className="sr-only" htmlFor="team-name">
              Team name
            </label>
            <input id="team-name" name="name" required placeholder="e.g. Mechanical Engineering" className="input" />
            <label className="sr-only" htmlFor="team-dept">
              Department or faculty
            </label>
            <input id="team-dept" name="department" placeholder="Department or faculty (optional)" className="input" />
            <button className="btn-ghost">Add team</button>
          </form>

          {hasFixtures && (
            <p className="text-sm text-muted">
              Fixtures are already made. New teams won&apos;t appear in them until you clear and regenerate.
            </p>
          )}

          {teams.length >= 2 && !hasFixtures && (
            <Link href={base} className="btn w-full">
              Done, go to fixtures
            </Link>
          )}

          <form action={deleteTournament} className="text-right">
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <button className="btn-danger">Delete this tournament</button>
          </form>
        </>
      )}
    </section>
  );
}
