export const SPORTS = [
  { value: "football", label: "Football", icon: "⚽" },
  { value: "basketball", label: "Basketball", icon: "🏀" },
  { value: "volleyball", label: "Volleyball", icon: "🏐" },
  { value: "handball", label: "Handball", icon: "🤾" },
] as const;

export const FORMATS = [
  { value: "league", label: "League (round-robin)" },
  { value: "knockout", label: "Knockout" },
] as const;

export function sportOf(value: string) {
  return SPORTS.find((s) => s.value === value) ?? { value, label: value, icon: "🏆" };
}

export function formatLabel(value: string) {
  return FORMATS.find((f) => f.value === value)?.label ?? value;
}
