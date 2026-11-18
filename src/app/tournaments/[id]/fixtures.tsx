import Link from "next/link";
import { clearFixtures, generateFixtures, updateMatchDetails } from "../../actions";
import type { Match } from "@/db";
import { roundName } from "@/lib/fixtures";
import MatchCard from "@/components/match-card";
import type { TeamInfo } from "./types";

type Props = {
  tournamentId: number;
  format: string;
  teams: TeamInfo[];
  fixtures: Match[];
  organizer: boolean;
  round?: number;
};

function toInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 16) : "";
}

export default function Fixtures({ tournamentId, format, teams, fixtures, organizer, round }: Props) {
  const byId = new Map(teams.map((t) => [t.id, t]));
  const base = `/tournaments/${tournamentId}`;

  if (fixtures.length === 0) {
    return (
      <section className="card flex flex-col items-start gap-4">
        <h2 className="h-display text-2xl">{format === "knockout" ? "No draw yet" : "No fixtures yet"}</h2>
        <p className="text-sm text-muted">
          {format === "knockout"
            ? "Generating will randomly pair the teams for the first round."
            : "Generating will schedule every team to play every other team once."}
        </p>
        {organizer &&
          (teams.length < 2 ? (
            <Link href={`${base}?tab=teams`} className="btn">
              Add teams first
            </Link>
          ) : (
            <form action={generateFixtures}>
              <input type="hidden" name="tournamentId" value={tournamentId} />
              <button className="btn">Generate fixtures for {teams.length} teams</button>
            </form>
          ))}
      </section>
    );
  }

  const rounds = [...new Set(fixtures.map((m) => m.round))].sort((a, b) => a - b);
  // Default to the first round that still has matches to play.
  const firstOpen = rounds.find((r) => fixtures.some((m) => m.round === r && (m.status === "upcoming" || m.status === "live")));
  const current = round && rounds.includes(round) ? round : firstOpen ?? rounds[0];
  const shown = fixtures.filter((m) => m.round === current);

  const scheduled = new Set(fixtures.flatMap((m) => [m.homeTeamId, m.awayTeamId]));
  const missing = teams.filter((t) => !scheduled.has(t.id));

  const side = (id: number | null, score: number | null, status: string) => {
    const t = id === null ? undefined : byId.get(id);
    return { name: t?.name ?? "TBD", faculty: t?.faculty, score: status === "upcoming" ? null : score ?? 0 };
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {rounds.map((r) => (
          <Link
            key={r}
            href={`${base}?round=${r}`}
            aria-current={r === current ? "page" : undefined}
            className="inline-flex min-h-10 min-w-12 shrink-0 items-center justify-center rounded-full border border-white/15 px-4 font-display text-base font-extrabold text-soft aria-[current=page]:border-white aria-[current=page]:bg-white aria-[current=page]:text-ink"
          >
            {format === "knockout" ? roundName(format, r, teams.length) : `R${r}`}
          </Link>
        ))}
      </div>

      {format !== "knockout" && <h2 className="h-display text-2xl">{roundName(format, current, teams.length)}</h2>}

      {organizer && missing.length > 0 && (
        <p className="rounded-xl bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          {missing.map((t) => t.name).join(", ")} {missing.length === 1 ? "was" : "were"} added after the fixtures were
          made. Clear and regenerate to include {missing.length === 1 ? "it" : "them"}.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((m) => (
          <MatchCard
            key={m.id}
            status={m.status}
            when={m.scheduledAt}
            venue={m.venue}
            home={side(m.homeTeamId, m.homeScore, m.status)}
            away={m.awayTeamId === null ? null : side(m.awayTeamId, m.awayScore, m.status)}
            byeText={format === "knockout" ? "gets a bye to the next round" : "has a bye this round"}
          >
            {organizer && m.status !== "bye" && (
              <details className="group text-sm">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-xl bg-white/5 font-semibold text-lime">
                  {m.scheduledAt || m.venue ? "Edit date & venue" : "Set date & venue"}
                </summary>
                <form action={updateMatchDetails} className="mt-3 flex flex-col gap-2">
                  <input type="hidden" name="tournamentId" value={tournamentId} />
                  <input type="hidden" name="matchId" value={m.id} />
                  <label className="sr-only" htmlFor={`when-${m.id}`}>
                    Date and time
                  </label>
                  <input id={`when-${m.id}`} type="datetime-local" name="scheduledAt" defaultValue={toInputValue(m.scheduledAt)} className="input" />
                  <label className="sr-only" htmlFor={`venue-${m.id}`}>
                    Venue
                  </label>
                  <input id={`venue-${m.id}`} name="venue" defaultValue={m.venue ?? ""} placeholder="Venue, e.g. Sports Centre" className="input" />
                  <button className="btn">Save</button>
                </form>
              </details>
            )}
          </MatchCard>
        ))}
      </div>

      {format === "knockout" && (
        <p className="text-sm text-muted">Later rounds appear once first-round results are in.</p>
      )}

      {organizer && (
        <form action={clearFixtures} className="text-right">
          <input type="hidden" name="tournamentId" value={tournamentId} />
          <button className="btn-danger">Clear fixtures</button>
        </form>
      )}
    </section>
  );
}
