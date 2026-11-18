import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, tournaments } from "@/db";
import { isOrganizer } from "@/lib/auth";
import { formatLabel, sportOf } from "@/lib/options";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [list, organizer] = await Promise.all([
    db().select().from(tournaments).orderBy(desc(tournaments.createdAt)),
    isOrganizer(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Tournaments</h1>
          <p className="text-slate-600">Departmental and inter-faculty competitions.</p>
        </div>
        {organizer && (
          <Link href="/tournaments/new" className="btn">
            + New tournament
          </Link>
        )}
      </div>

      {list.length === 0 ? (
        <div className="card text-center text-slate-600">
          No tournaments yet.
          {organizer ? " Create the first one!" : " Check back soon."}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((t) => {
            const sport = sportOf(t.sport);
            return (
              <li key={t.id}>
                <Link href={`/tournaments/${t.id}`} className="card block hover:border-turf">
                  <div className="text-2xl">{sport.icon}</div>
                  <h2 className="mt-2 text-lg font-bold">{t.name}</h2>
                  <p className="text-sm text-slate-600">
                    {sport.label} · {formatLabel(t.format)}
                    {t.host ? ` · ${t.host}` : ""}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
