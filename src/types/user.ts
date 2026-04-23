import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: "admin" | "user";
  banned: boolean;
  createdAt: Timestamp;
}

export interface UserOrder {
  id: string;
  items: string[];
  totalAmount: number;
  status: "pending" | "paid" | "cancelled";
  createdAt: Timestamp;
}

export interface UserTeamRegistration {
  id: string;
  teamName: string;
  packageName: string;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Timestamp;
}

export type UserRole = "admin" | "user";

export interface EditUserPayload {
  displayName: string;
  email: string;
}

export interface ActionResult {
  success: boolean;
  message: string;
}
