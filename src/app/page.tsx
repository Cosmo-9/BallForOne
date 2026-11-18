import Link from "next/link";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, matches, teams, tournaments } from "@/db";
import { isOrganizer } from "@/lib/auth";
import { findFaculty, teamFaculty } from "@/lib/faculties";
import { formatLabel, sportOf } from "@/lib/options";
import MatchCard from "@/components/match-card";
import Crest from "@/components/crest";

export const dynamic = "force-dynamic";

const home = alias(teams, "home");
const away = alias(teams, "away");

export default async function Home() {
  const [list, upcoming, organizer] = await Promise.all([
    db().select().from(tournaments).orderBy(desc(tournaments.createdAt)),
    db()
      .select({
        id: matches.id,
        tournamentId: matches.tournamentId,
        status: matches.status,
        scheduledAt: matches.scheduledAt,
        venue: matches.venue,
        homeScore: matches.homeScore,
        awayScore: matches.awayScore,
        tournamentName: tournaments.name,
        host: tournaments.host,
        homeName: home.name,
        homeDept: home.department,
        awayName: away.name,
        awayDept: away.department,
      })
      .from(matches)
      .innerJoin(tournaments, eq(tournaments.id, matches.tournamentId))
      .innerJoin(home, eq(home.id, matches.homeTeamId))
      .innerJoin(away, eq(away.id, matches.awayTeamId))
      .where(and(inArray(matches.status, ["live", "upcoming"])))
      .orderBy(sql`case when ${matches.status} = 'live' then 0 else 1 end`, asc(matches.scheduledAt), asc(matches.id))
      .limit(6),
    isOrganizer(),
  ]);

  const live = upcoming.filter((m) => m.status === "live");
  const next = upcoming.filter((m) => m.status !== "live");

  const card = (m: (typeof upcoming)[number]) => (
    <MatchCard
      key={m.id}
      href={`/tournaments/${m.tournamentId}`}
      context={m.tournamentName}
      status={m.status}
      when={m.scheduledAt}
      venue={m.venue}
      home={{ name: m.homeName, faculty: teamFaculty(m.homeDept, m.host), score: m.status === "upcoming" ? null : m.homeScore ?? 0 }}
      away={{ name: m.awayName, faculty: teamFaculty(m.awayDept, m.host), score: m.status === "upcoming" ? null : m.awayScore ?? 0 }}
    />
  );

  return (
    <div className="flex flex-col gap-8">
      {live.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="eyebrow flex items-center gap-2">
            <span className="size-2 rounded-full bg-red-500" /> Live now
          </h2>
          {live.map(card)}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="h-display text-2xl">Coming up</h2>
        {next.length === 0 ? (
          <p className="card text-muted">No fixtures scheduled yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">{next.map(card)}</div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="h-display text-2xl">Tournaments</h2>
          {organizer && (
            <Link href="/tournaments/new" className="text-sm font-semibold text-lime">
              + New
            </Link>
          )}
        </div>

        {list.length === 0 ? (
          <div className="card flex flex-col items-start gap-3">
            <p className="text-muted">No tournaments yet.</p>
            {organizer ? (
              <Link href="/tournaments/new" className="btn">
                Create the first one
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-semibold text-lime">
                Are you a sports rep? Sign in →
              </Link>
            )}
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {list.map((t) => {
              const sport = sportOf(t.sport);
              const fac = findFaculty(t.host);
              return (
                <li key={t.id}>
                  <Link
                    href={`/tournaments/${t.id}`}
                    className="surface flex h-full flex-col gap-3 rounded-[20px] p-4 transition hover:border-white/20"
                    style={
                      fac
                        ? { background: `radial-gradient(90% 80% at 100% 0%, ${fac.color}2E 0%, transparent 65%), linear-gradient(180deg, #141C2B 0%, #0D121D 100%)` }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className="eyebrow text-lime">{sport.label}</span>
                      {fac && <Crest name={fac.name} faculty={fac} size={28} />}
                    </div>
                    <h3 className="h-display text-[26px]">{t.name}</h3>
                    <p className="text-xs text-muted">
                      {formatLabel(t.format)}
                      {t.host ? ` · ${t.host}` : ""}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
