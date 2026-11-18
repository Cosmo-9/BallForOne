import Link from "next/link";
import { createTournament } from "../../actions";
import { requireOrganizer } from "@/lib/auth";
import { FORMATS, SPORTS } from "@/lib/options";

const ERRORS: Record<string, string> = {
  name: "Give the tournament a name.",
  sport: "Pick a sport.",
  format: "Pick a format.",
};

export default async function NewTournamentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireOrganizer();
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href="/" className="text-sm text-slate-600 hover:underline">
        ← All tournaments
      </Link>
      <form action={createTournament} className="card space-y-4">
        <h1 className="text-xl font-bold">New tournament</h1>

        <div>
          <label htmlFor="name" className="label">
            Name
          </label>
          <input id="name" name="name" required placeholder="Engineering Faculty Cup 2026" className="input" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sport" className="label">
              Sport
            </label>
            <select id="sport" name="sport" className="input" defaultValue="football">
              {SPORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.icon} {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="format" className="label">
              Format
            </label>
            <select id="format" name="format" className="input" defaultValue="league">
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="host" className="label">
            Faculty or department (optional)
          </label>
          <input id="host" name="host" placeholder="Faculty of Engineering" className="input" />
        </div>

        {error && ERRORS[error] && <p className="text-sm text-red-600">{ERRORS[error]}</p>}
        <button className="btn w-full">Create tournament</button>
      </form>
    </div>
  );
}
