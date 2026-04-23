import type { Timestamp } from "firebase/firestore";

export interface News {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  category: "news" | "highlight";
  videoUrl?: string;
  publishedAt: Timestamp | string; // Support both Firestore Timestamp and serialized ISO string
  status: "draft" | "published";
  authorId: string;
  authorName: string;
}
