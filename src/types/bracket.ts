import type { Timestamp } from "firebase/firestore";

export interface BracketMatch {
  id: string;
  competitionId: string;
  round: number;
  roundName: "RO16" | "QF" | "SF" | "F";
  position: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  winnerId: string;
  status: "scheduled" | "live" | "completed";
  date: Timestamp | string; // Support both Firestore Timestamp and serialized ISO string
  venue: string;
  nextMatchId: string;
}
