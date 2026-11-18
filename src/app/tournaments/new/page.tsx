import Link from "next/link";
import { createTournament } from "../../actions";
import { requireOrganizer } from "@/lib/auth";
import { FACULTIES } from "@/lib/faculties";
import { FORMATS, SPORTS } from "@/lib/options";

const ERRORS: Record<string, string> = {
  name: "Give the tournament a name.",
  sport: "Pick a sport.",
  format: "Pick a format.",
};

const FORMAT_HINTS: Record<string, string> = {
  league: "Everyone plays everyone. Top of the table wins.",
  knockout: "Lose and you're out, all the way to the final.",
};

const SPORT_ICONS: Record<string, string> = {
  football: "M12 7l4 3-1.5 4.5h-5L8 10z",
  basketball: "M3 12h18M12 3v18M6 5.5c3 3 3 10 0 13M18 5.5c-3 3-3 10 0 13",
  volleyball: "M12 3c0 5 3 8 8 9M12 12c-4 3-5 6-4 9M12 12c-5-1-8 0-9 2",
  handball: "M5 9c4 2 10 2 14 0M5 15c4-2 10-2 14 0",
};

export default async function NewTournamentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireOrganizer();
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Close" className="btn-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
        <span className="text-[13px] font-semibold text-muted">Step 1 of 2</span>
        <span className="w-11" />
      </div>

      <h1 className="h-display text-[40px]">New tournament</h1>

      <form action={createTournament} className="flex flex-col gap-6">
        <div>
          <label htmlFor="name" className="label">
            Name
          </label>
          <input id="name" name="name" required placeholder="Inter-Faculty Football Cup" className="input" />
        </div>

        <fieldset>
          <legend className="label">Sport</legend>
          <div className="grid grid-cols-4 gap-2">
            {SPORTS.map((s, i) => (
              <label key={s.value} className="choice min-h-[76px] flex-col items-center justify-center gap-1.5 text-xs font-semibold text-soft has-[:checked]:text-lime">
                <input type="radio" name="sport" value={s.value} defaultChecked={i === 0} className="sr-only" />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d={SPORT_ICONS[s.value]} />
                </svg>
                {s.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">Format</legend>
          <div className="grid grid-cols-2 gap-2.5">
            {FORMATS.map((f, i) => (
              <label key={f.value} className="choice min-h-24 flex-col justify-center gap-1.5 p-4">
                <input type="radio" name="format" value={f.value} defaultChecked={i === 0} className="sr-only" />
                <span className="h-display text-[22px]">{f.value === "league" ? "League" : "Knockout"}</span>
                <span className="text-xs leading-snug text-muted">{FORMAT_HINTS[f.value]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="host" className="label">
            Host faculty
          </label>
          <select id="host" name="host" className="input" defaultValue="">
            <option value="">University-wide (no host faculty)</option>
            {FACULTIES.map((f) => (
              <option key={f.code} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-muted">
            The tournament page takes on the host faculty&apos;s colour. For departmental tournaments, pick the faculty the
            departments belong to.
          </p>
        </div>

        {error && ERRORS[error] && <p className="text-sm text-red-400">{ERRORS[error]}</p>}
        <button className="btn w-full text-base">
          Next: add teams
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
    </div>
  );
}
