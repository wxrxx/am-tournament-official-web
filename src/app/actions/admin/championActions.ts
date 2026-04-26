"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// ─── Helper: Verify caller is admin ────────────────────────────
async function verifyAdmin(currentUid: string): Promise<void> {
  const userDoc = await adminDb.collection("users").doc(currentUid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    throw new Error("ไม่มีสิทธิ์ดำเนินการ: ต้องเป็น Admin เท่านั้น");
  }
}

interface ActionResult {
  success: boolean;
  message: string;
}

export interface Champion {
  id: string;
  competitionId: string;
  competitionName: string;
  season: string;
  year: number;
  champion: string;
  runnerUp: string;
  thirdPlace: string;
}

// ─── Action 1: Get Champions ────────────────────────────────────
export async function getChampions(
  currentUid: string
): Promise<{
  success: boolean;
  message: string;
  champions: Champion[];
}> {
  try {
    await verifyAdmin(currentUid);

    const snap = await adminDb
      .collection("champions")
      .orderBy("year", "desc")
      .get();

    const champions: Champion[] = snap.docs.map((d) => ({
      id: d.id,
      competitionId: (d.data().competitionId as string) ?? "",
      competitionName: (d.data().competitionName as string) ?? "",
      season: (d.data().season as string) ?? "",
      year: (d.data().year as number) ?? 0,
      champion: (d.data().champion as string) ?? "",
      runnerUp: (d.data().runnerUp as string) ?? "",
      thirdPlace: (d.data().thirdPlace as string) ?? "",
    }));

    return { success: true, message: "", champions };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg, champions: [] };
  }
}

// ─── Action 2: Add Champion ─────────────────────────────────────
export async function addChampion(
  currentUid: string,
  data: Omit<Champion, "id">
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    if (!data.competitionName.trim() || !data.champion.trim()) {
      return { success: false, message: "กรุณากรอกชื่อรายการและชื่อทีมแชมป์" };
    }

    await adminDb.collection("champions").add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "เพิ่มทำเนียบแชมป์เรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 3: Update Champion ──────────────────────────────────
export async function updateChampion(
  currentUid: string,
  championId: string,
  data: Partial<Omit<Champion, "id">>
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const ref = adminDb.collection("champions").doc(championId);
    const snap = await ref.get();
    if (!snap.exists) {
      return { success: false, message: "ไม่พบข้อมูลแชมป์นี้" };
    }

    await ref.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "อัปเดตทำเนียบแชมป์เรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 4: Delete Champion ──────────────────────────────────
export async function deleteChampion(
  currentUid: string,
  championId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const ref = adminDb.collection("champions").doc(championId);
    const snap = await ref.get();
    if (!snap.exists) {
      return { success: false, message: "ไม่พบข้อมูลแชมป์นี้" };
    }

    await ref.delete();

    return { success: true, message: "ลบทำเนียบแชมป์เรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}
