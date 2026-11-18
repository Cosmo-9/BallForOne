// Fixture generation. These functions only work out who plays whom;
// they don't touch the database, so they're easy to test and reuse.

export type Pairing = {
  round: number;
  homeTeamId: number;
  awayTeamId: number | null; // null means a bye
};

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * League (round-robin): every team plays every other team once.
 * Uses the "circle method": fix one team, rotate the rest each round,
 * so nobody plays twice in a round. With an odd number of teams,
 * one team sits out (a bye) each round.
 */
export function roundRobin(teamIds: number[]): Pairing[] {
  const slots: (number | null)[] = shuffle(teamIds);
  if (slots.length % 2 === 1) slots.push(null);
  const n = slots.length;
  const pairings: Pairing[] = [];

  for (let round = 1; round < n; round++) {
    for (let i = 0; i < n / 2; i++) {
      let home = slots[i];
      let away = slots[n - 1 - i];
      // Swap home/away on alternate rounds so it's fair.
      if (round % 2 === 0) [home, away] = [away, home];
      if (home === null && away === null) continue;
      if (home === null) pairings.push({ round, homeTeamId: away!, awayTeamId: null });
      else pairings.push({ round, homeTeamId: home, awayTeamId: away });
    }
    // Rotate everyone except the first slot.
    slots.splice(1, 0, slots.pop()!);
  }
  return pairings;
}

/**
 * Knockout: a random draw for the first round. If the number of teams
 * isn't a power of two (2, 4, 8, 16…), some teams get a bye straight
 * into round 2. Later rounds are created once results are in.
 */
export function knockoutFirstRound(teamIds: number[]): Pairing[] {
  const drawn = shuffle(teamIds);
  const size = bracketSize(drawn.length);
  const byes = size - drawn.length;
  const pairings: Pairing[] = [];

  for (let i = 0; i < byes; i++) {
    pairings.push({ round: 1, homeTeamId: drawn[i], awayTeamId: null });
  }
  for (let i = byes; i < drawn.length; i += 2) {
    pairings.push({ round: 1, homeTeamId: drawn[i], awayTeamId: drawn[i + 1] });
  }
  return pairings;
}

/** Smallest power of two that fits this many teams. */
export function bracketSize(teamCount: number) {
  let size = 2;
  while (size < teamCount) size *= 2;
  return size;
}

/** "Final", "Semi-finals", "Quarter-finals", "Round of 16", or "Round 3" for leagues. */
export function roundName(format: string, round: number, teamCount: number) {
  if (format !== "knockout") return `Round ${round}`;
  const teamsLeft = bracketSize(teamCount) / 2 ** (round - 1);
  if (teamsLeft === 2) return "Final";
  if (teamsLeft === 4) return "Semi-finals";
  if (teamsLeft === 8) return "Quarter-finals";
  return `Round of ${teamsLeft}`;
}
