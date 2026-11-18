import Link from "next/link";
import Crest from "./crest";
import type { Faculty } from "@/lib/faculties";

export type Side = { name: string; faculty?: Faculty; score: number | null };

type Props = {
  home: Side;
  away: Side | null; // null = bye
  status: string; // upcoming, live, finished, bye
  when: Date | null;
  venue: string | null;
  context?: string; // e.g. tournament name, shown on the home page
  href?: string;
  byeText?: string;
  children?: React.ReactNode; // organizer controls
};

export function formatWhen(date: Date) {
  // Dates are stored as entered, so show them without shifting time zones.
  return date.toLocaleString("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function glow(home?: Faculty, away?: Faculty) {
  const layers = [];
  if (home) layers.push(`radial-gradient(85% 90% at 0% 0%, ${home.color}33 0%, transparent 60%)`);
  if (away) layers.push(`radial-gradient(85% 90% at 100% 100%, ${away.color}33 0%, transparent 60%)`);
  layers.push("linear-gradient(180deg, #141C2B 0%, #0D121D 100%)");
  return layers.join(", ");
}

function Row({ side }: { side: Side }) {
  return (
    <div className="flex items-center gap-3">
      <Crest name={side.name} faculty={side.faculty} size={34} />
      <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{side.name}</span>
      {side.score !== null && (
        <span className="w-8 text-right font-display text-3xl font-extrabold italic leading-none">
          {side.score}
        </span>
      )}
    </div>
  );
}

export default function MatchCard({ home, away, status, when, venue, context, href, byeText, children }: Props) {
  const live = status === "live";

  if (!away) {
    return (
      <div className="surface flex items-center gap-3 rounded-[20px] px-4 py-3">
        <Crest name={home.name} faculty={home.faculty} size={30} />
        <p className="text-sm text-muted">
          <span className="font-semibold text-white">{home.name}</span> {byeText ?? "has a bye"}
        </p>
      </div>
    );
  }

  const pill = live ? (
    <span className="pill pill-live">LIVE</span>
  ) : status === "finished" ? (
    <span className="pill pill-done">Full time</span>
  ) : (
    <span className="pill pill-upcoming">{when ? formatWhen(when) : "Date TBC"}</span>
  );

  const body = (
    <>
      <div className="flex items-center justify-between gap-3 text-xs">
        {pill}
        <span className="truncate text-muted">{[context, venue].filter(Boolean).join(" · ")}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        <Row side={home} />
        <Row side={away} />
      </div>
    </>
  );

  const style = {
    background: glow(home.faculty, away.faculty),
    borderColor: live ? "rgba(255,90,70,0.45)" : undefined,
  };

  return (
    <article className="surface flex flex-col gap-3 rounded-[20px] p-4" style={style}>
      {href ? (
        <Link href={href} className="flex flex-col gap-3">
          {body}
        </Link>
      ) : (
        body
      )}
      {children}
    </article>
  );
}
