// UNILAG faculties and their official colours.
// Colours marked `official: true` come from the university's published list;
// the rest are neutral placeholders until their official colours are added.

export type Faculty = {
  code: string;
  name: string;
  color: string;
  text: string; // a readable text colour on top of `color`
  official: boolean;
};

export const FACULTIES: Faculty[] = [
  { code: "ART", name: "Arts", color: "#8C9AB3", text: "#0B0E13", official: false },
  { code: "BMS", name: "Basic Medical Sciences", color: "#7FA3A8", text: "#0B0E13", official: false },
  { code: "CLS", name: "Clinical Sciences", color: "#A79BB8", text: "#0B0E13", official: false },
  { code: "DEN", name: "Dental Sciences", color: "#9FB3A0", text: "#0B0E13", official: false },
  { code: "EDU", name: "Education", color: "#FFFFC5", text: "#0B0E13", official: true },
  { code: "ENG", name: "Engineering", color: "#FFA500", text: "#0B0E13", official: true },
  { code: "ENV", name: "Environmental Sciences", color: "#D3D3D3", text: "#0B0E13", official: true },
  { code: "HPR", name: "Health Professions", color: "#FF0000", text: "#0B0E13", official: true },
  { code: "LAW", name: "Law", color: "#87CEEB", text: "#0B0E13", official: true },
  { code: "LIF", name: "Life Sciences", color: "#FFDF00", text: "#0B0E13", official: true },
  { code: "MGS", name: "Management Sciences", color: "#32CD32", text: "#0B0E13", official: true },
  { code: "PHA", name: "Pharmacy", color: "#800080", text: "#FFFFFF", official: true },
  { code: "PES", name: "Physical & Earth Sciences", color: "#B9A281", text: "#0B0E13", official: true },
  { code: "SOC", name: "Social Sciences", color: "#ADEBB3", text: "#0B0E13", official: true },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/^faculty of\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Find a faculty from free text like "Engineering", "Faculty of Law" or "ENG". */
export function findFaculty(text: string | null | undefined): Faculty | undefined {
  if (!text) return undefined;
  const n = normalize(text);
  return FACULTIES.find((f) => normalize(f.name) === n || f.code.toLowerCase() === n);
}

/** Up to three letters for a crest, e.g. "Mech Eng" → "ME". */
export function initials(name: string) {
  const words = name.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * The colour for a team: its own faculty if its department is a faculty
 * (inter-faculty tournaments), otherwise the host faculty's colour.
 */
export function teamFaculty(department: string | null, host: string | null) {
  return findFaculty(department) ?? findFaculty(host);
}
