import type { Timestamp } from "firebase/firestore";

export interface Match {
  id: string;
  competitionId: string;
  groupId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: Timestamp;
  venue: string;
  status: "scheduled" | "live" | "completed" | "postponed";
  round: "group" | "knockout";
}

export interface Standing {
  competitionId: string;
  groupId: string;
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}
