import { clearFixtures, generateFixtures, updateMatchDetails } from "../../actions";
import type { Match } from "@/db";
import { roundName } from "@/lib/fixtures";

type Props = {
  tournamentId: number;
  format: string;
  teamNames: Map<number, string>;
  fixtures: Match[];
  organizer: boolean;
};

// Dates are stored as entered and shown the same way (no time-zone shifting).
function formatWhen(date: Date) {
  return date.toLocaleString("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 16) : "";
}

export default function Fixtures({ tournamentId, format, teamNames, fixtures, organizer }: Props) {
  const name = (id: number | null) => (id === null ? "TBD" : teamNames.get(id) ?? "Unknown team");

  // Teams added after the fixtures were generated.
  const scheduled = new Set(fixtures.flatMap((m) => [m.homeTeamId, m.awayTeamId]));
  const missing = [...teamNames.keys()].filter((id) => !scheduled.has(id));

  const rounds = new Map<number, Match[]>();
  for (const m of fixtures) {
    rounds.set(m.round, [...(rounds.get(m.round) ?? []), m]);
  }
  const roundNumbers = [...rounds.keys()].sort((a, b) => a - b);

  return (
    <section id="fixtures" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Fixtures</h2>
        {organizer && fixtures.length > 0 && (
          <form action={clearFixtures}>
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <button className="btn-danger">Clear fixtures</button>
          </form>
        )}
      </div>

      {fixtures.length === 0 ? (
        <div className="card space-y-3">
          <p className="text-slate-600">
            {format === "knockout"
              ? "No draw yet. Generating will randomly pair teams for the first round."
              : "No fixtures yet. Generating will schedule every team to play every other team once."}
          </p>
          {organizer &&
            (teamNames.size < 2 ? (
              <p className="text-sm text-slate-500">Add at least two teams first.</p>
            ) : (
              <form action={generateFixtures}>
                <input type="hidden" name="tournamentId" value={tournamentId} />
                <button className="btn">Generate fixtures</button>
              </form>
            ))}
        </div>
      ) : (
        <>
          {organizer && missing.length > 0 && (
            <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
              {missing.map((id) => name(id)).join(", ")} {missing.length === 1 ? "was" : "were"} added
              after the fixtures were made. Clear and regenerate to include{" "}
              {missing.length === 1 ? "it" : "them"}.
            </p>
          )}

          {roundNumbers.map((round) => (
            <div key={round} className="card space-y-2 p-0">
              <h3 className="border-b border-slate-100 px-5 py-3 font-bold">
                {roundName(format, round, teamNames.size)}
              </h3>
              <ul className="divide-y divide-slate-100">
                {rounds.get(round)!.map((m) => (
                  <li key={m.id} className="px-5 py-3">
                    {m.status === "bye" ? (
                      <p className="text-slate-600">
                        <span className="font-semibold text-ink">{name(m.homeTeamId)}</span>{" "}
                        {format === "knockout" ? "gets a bye to the next round" : "has a bye this round"}
                      </p>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="flex-1 text-right font-semibold">{name(m.homeTeamId)}</span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                            VS
                          </span>
                          <span className="flex-1 font-semibold">{name(m.awayTeamId)}</span>
                        </div>
                        <p className="mt-1 text-center text-xs text-slate-500">
                          {m.scheduledAt ? formatWhen(m.scheduledAt) : "Date not set"}
                          {m.venue ? ` · ${m.venue}` : ""}
                        </p>
                        {organizer && (
                          <details className="mt-2 text-sm">
                            <summary className="cursor-pointer text-center text-turf">
                              Set date &amp; venue
                            </summary>
                            <form
                              action={updateMatchDetails}
                              className="mt-2 flex flex-wrap items-center justify-center gap-2"
                            >
                              <input type="hidden" name="tournamentId" value={tournamentId} />
                              <input type="hidden" name="matchId" value={m.id} />
                              <input
                                type="datetime-local"
                                name="scheduledAt"
                                defaultValue={toInputValue(m.scheduledAt)}
                                className="input w-auto"
                              />
                              <input
                                name="venue"
                                defaultValue={m.venue ?? ""}
                                placeholder="Venue"
                                className="input w-auto"
                              />
                              <button className="btn-ghost">Save</button>
                            </form>
                          </details>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {format === "knockout" && (
            <p className="text-sm text-slate-500">
              Later rounds appear once first-round results are in (coming in the next steps).
            </p>
          )}
        </>
      )}
    </section>
  );
}
