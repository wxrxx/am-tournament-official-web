"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { News } from "@/types/news";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Helper: Verify Admin ──────────────────────────────────────
async function verifyAdmin(currentUid: string): Promise<void> {
  const userDoc = await adminDb.collection("users").doc(currentUid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    throw new Error("ไม่มีสิทธิ์ดำเนินการ: ต้องเป็น Admin เท่านั้น");
  }
}

export interface ActionResult {
  success: boolean;
  message: string;
}

// ─── 1. Create News ─────────────────────────────────────────────
export async function createNews(
  currentUid: string,
  data: Omit<News, "id" | "publishedAt">
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const newsRef = adminDb.collection("news").doc();
    await newsRef.set({
      ...data,
      publishedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "สร้างข่าว/ไฮไลต์สำเร็จ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── 2. Update News ─────────────────────────────────────────────
export async function updateNews(
  currentUid: string,
  newsId: string,
  data: Partial<Omit<News, "id" | "publishedAt">>
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const newsRef = adminDb.collection("news").doc(newsId);
    const newsDoc = await newsRef.get();

    if (!newsDoc.exists) {
      return { success: false, message: "ไม่พบข่าว/ไฮไลต์นี้" };
    }

    await newsRef.update(data);

    return { success: true, message: "อัปเดตข้อมูลสำเร็จ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Helper: Extract Cloudinary Public ID ───────────────────────
function extractPublicId(url: string): string | null {
  if (!url.includes("res.cloudinary.com")) return null;
  // url pattern: .../upload/v1234567890/folder/filename.jpg
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const pathAndVersion = parts[1];
    const withoutVersion = pathAndVersion.replace(/^v\d+\//, "");
    const lastDotIndex = withoutVersion.lastIndexOf(".");
    if (lastDotIndex === -1) return withoutVersion;
    return withoutVersion.substring(0, lastDotIndex);
  } catch {
    return null;
  }
}

// ─── 3. Delete News ─────────────────────────────────────────────
export async function deleteNews(
  currentUid: string,
  newsId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const newsRef = adminDb.collection("news").doc(newsId);
    const newsDoc = await newsRef.get();

    if (!newsDoc.exists) {
      return { success: false, message: "ไม่พบข่าว/ไฮไลต์นี้" };
    }

    const data = newsDoc.data() as News;
    const batch = adminDb.batch();

    batch.delete(newsRef);

    // Delete image from Cloudinary if it exists
    if (data.coverImage) {
      const publicId = extractPublicId(data.coverImage);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error("Cloudinary delete error:", cloudinaryError);
          // Proceed with database deletion even if image delete fails
        }
      }
    }

    await batch.commit();

    return { success: true, message: "ลบข่าว/ไฮไลต์เรียบร้อยแล้ว" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── 4. Publish News ────────────────────────────────────────────
export async function publishNews(
  currentUid: string,
  newsId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const newsRef = adminDb.collection("news").doc(newsId);
    await newsRef.update({ status: "published" });

    return { success: true, message: "เผยแพร่ข่าวสำเร็จ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── 5. Get News ────────────────────────────────────────────────
export async function getNews(
  status?: "draft" | "published",
  category?: "news" | "highlight",
  limitCount: number = 20
): Promise<News[]> {
  try {
    let query: FirebaseFirestore.Query = adminDb.collection("news");

    if (status) {
      query = query.where("status", "==", status);
    }
    if (category) {
      query = query.where("category", "==", category);
    }

    query = query.orderBy("publishedAt", "desc").limit(limitCount);

    const snap = await query.get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate().toISOString() : data.publishedAt,
      } as unknown as News;
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}
