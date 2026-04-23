import type { Timestamp } from "firebase/firestore";

export interface Club {
  id: string;
  name: string;
  logo: string;
  contactName: string;
  contactPhone: string;
  status: "active" | "inactive";
  registrationId: string;
  approvedAt: Timestamp | string;
  playerCount: number;
}
