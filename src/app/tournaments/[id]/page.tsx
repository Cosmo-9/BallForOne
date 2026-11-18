import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, count, eq } from "drizzle-orm";
import { db, matches, players, teams, tournaments } from "@/db";
import { isOrganizer } from "@/lib/auth";
import { findFaculty, teamFaculty } from "@/lib/faculties";
import { sportOf } from "@/lib/options";
import Crest from "@/components/crest";
import Fixtures from "./fixtures";
import TeamsTab from "./teams-tab";
import type { TeamInfo } from "./types";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  "need-teams": "Add at least two teams before generating fixtures.",
  "fixtures-exist": "Fixtures already exist. Clear them first to regenerate.",
  "fixtures-played": "Some matches already have results, so fixtures can't be cleared.",
  team: "Give the team a name.",
  "pick-faculty": "Tap at least one faculty to add.",
};

export default async function TournamentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; tab?: string; round?: string }>;
}) {
  const { id } = await params;
  const { error, tab, round } = await searchParams;
  const tournamentId = Number(id);
  if (!Number.isInteger(tournamentId) || tournamentId <= 0) notFound();

  const [tournament] = await db().select().from(tournaments).where(eq(tournaments.id, tournamentId));
  if (!tournament) notFound();

  const [teamRows, fixtures, organizer] = await Promise.all([
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

  const host = findFaculty(tournament.host);
  const teamList: TeamInfo[] = teamRows.map((t) => ({ ...t, faculty: teamFaculty(t.department, tournament.host) }));
  const sport = sportOf(tournament.sport);
  const activeTab = tab === "teams" ? "teams" : "fixtures";
  const errorMessage = error ? ERRORS[error] : undefined;
  const base = `/tournaments/${tournamentId}`;
  const formatName = tournament.format === "knockout" ? "Knockout" : "League";

  return (
    <div className="flex flex-col gap-5">
      {/* The host faculty's colour floods the top of the page */}
      {host && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
          style={{
            background: `radial-gradient(900px 360px at 80% -60px, ${host.color}66 0%, ${host.color}1F 40%, transparent 75%)`,
          }}
        />
      )}

      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Back to all tournaments" className="btn-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <p className="eyebrow" style={{ color: host?.color ?? "#C8FF2E" }}>
          {sport.label} · {formatName}
        </p>
        <h1 className="h-display text-[40px] sm:text-5xl">{tournament.name}</h1>
        <div className="mt-1 flex items-center gap-2.5">
          {host && <Crest name={host.name} faculty={host} size={30} />}
          <span className="text-[13px] text-soft">
            {host ? (
              <>
                Hosted by <strong className="text-white">Faculty of {host.name}</strong> ·{" "}
              </>
            ) : tournament.host ? (
              <>Hosted by {tournament.host} · </>
            ) : null}
            {teamList.length} {teamList.length === 1 ? "team" : "teams"}
          </span>
        </div>
      </div>

      <nav aria-label="Tournament sections" className="flex gap-1 rounded-[14px] bg-white/5 p-1">
        <Link href={base} aria-current={activeTab === "fixtures" ? "page" : undefined} className="tab">
          Fixtures
        </Link>
        <Link href={`${base}?tab=teams`} aria-current={activeTab === "teams" ? "page" : undefined} className="tab">
          Teams
        </Link>
        <span className="tab cursor-default opacity-50" title="Coming soon">
          Table
        </span>
        <span className="tab cursor-default opacity-50" title="Coming soon">
          Stats
        </span>
      </nav>

      {errorMessage && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{errorMessage}</p>}

      {activeTab === "fixtures" ? (
        <Fixtures
          tournamentId={tournamentId}
          format={tournament.format}
          teams={teamList}
          fixtures={fixtures}
          organizer={organizer}
          round={round ? Number(round) : undefined}
        />
      ) : (
        <TeamsTab tournamentId={tournamentId} teams={teamList} organizer={organizer} hasFixtures={fixtures.length > 0} />
      )}
    </div>
  );
}
