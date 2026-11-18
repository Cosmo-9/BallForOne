import type { Faculty } from "@/lib/faculties";
import { initials } from "@/lib/faculties";

type Props = {
  name: string;
  faculty?: Faculty;
  size?: number;
};

// A glossy square badge in the team's faculty colour.
export default function Crest({ name, faculty, size = 40 }: Props) {
  const color = faculty?.color ?? "#3A4558";
  const code = faculty && faculty.name === name ? faculty.code : initials(name);

  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center font-display font-extrabold"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        fontSize: Math.round(size * 0.4),
        color: faculty?.text ?? "#F2F4F7",
        background: `linear-gradient(145deg, ${color}, ${color}A6)`,
        boxShadow: `0 6px 16px ${color}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
      }}
    >
      {code}
    </span>
  );
}
