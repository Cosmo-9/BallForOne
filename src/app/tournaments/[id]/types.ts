import type { Faculty } from "@/lib/faculties";

export type TeamInfo = {
  id: number;
  name: string;
  department: string | null;
  playerCount: number;
  faculty?: Faculty;
};
