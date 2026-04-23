"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { CompetitionFormData } from "@/types/competition";

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

// ─── Action 1: Create Competition ─────────────────────────────
export async function createCompetition(
  currentUid: string,
  data: CompetitionFormData
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    if (!data.name?.trim()) {
      return { success: false, message: "กรุณากรอกชื่อรายการ" };
    }
    if (!data.startDate || !data.endDate) {
      return { success: false, message: "กรุณากรอกวันที่เปิด/ปิดรับสมัคร" };
    }

    await adminDb.collection("competitions").add({
      name: data.name.trim(),
      type: data.type || "11 คน",
      maxPlayers: data.maxPlayers || 11,
      maxAge: data.maxAge || "ไม่จำกัด",
      teamQuota: data.teamQuota || 16,
      entryFee: data.entryFee || 0,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || "Open",
      numberOfGroups: data.numberOfGroups || 4,
      teamsPerGroup: data.teamsPerGroup || 4,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "เพิ่มรายการแข่งขันสำเร็จ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 2: Update Competition ─────────────────────────────
export async function updateCompetition(
  currentUid: string,
  competitionId: string,
  data: Partial<CompetitionFormData>
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const compRef = adminDb.collection("competitions").doc(competitionId);
    const compDoc = await compRef.get();

    if (!compDoc.exists) {
      return { success: false, message: "ไม่พบรายการแข่งขันนี้ในระบบ" };
    }

    const updatePayload: Record<string, string | number> = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.maxPlayers !== undefined) updatePayload.maxPlayers = data.maxPlayers;
    if (data.maxAge !== undefined) updatePayload.maxAge = data.maxAge;
    if (data.teamQuota !== undefined) updatePayload.teamQuota = data.teamQuota;
    if (data.entryFee !== undefined) updatePayload.entryFee = data.entryFee;
    if (data.startDate !== undefined) updatePayload.startDate = data.startDate;
    if (data.endDate !== undefined) updatePayload.endDate = data.endDate;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.numberOfGroups !== undefined) updatePayload.numberOfGroups = data.numberOfGroups;
    if (data.teamsPerGroup !== undefined) updatePayload.teamsPerGroup = data.teamsPerGroup;

    await compRef.update(updatePayload);

    return { success: true, message: "แก้ไขรายการแข่งขันสำเร็จ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 3: Toggle Competition Status ──────────────────────
export async function toggleCompetitionStatus(
  currentUid: string,
  competitionId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const compRef = adminDb.collection("competitions").doc(competitionId);
    const compDoc = await compRef.get();

    if (!compDoc.exists) {
      return { success: false, message: "ไม่พบรายการแข่งขันนี้ในระบบ" };
    }

    const currentStatus = compDoc.data()?.status as string;
    const newStatus = currentStatus === "Open" ? "Closed" : "Open";

    await compRef.update({ status: newStatus });

    return {
      success: true,
      message: `${newStatus === "Open" ? "เปิด" : "ปิด"}การรับสมัครแล้ว`,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 4: Delete Competition (Cascading) ─────────────────
// Cascading delete: competitions → groups, matches, standings, bracket_matches
// Handles Firestore batch limit of 500 by chunking operations
export async function deleteCompetition(
  currentUid: string,
  competitionId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const compRef = adminDb.collection("competitions").doc(competitionId);
    const compDoc = await compRef.get();

    if (!compDoc.exists) {
      return { success: false, message: "ไม่พบรายการแข่งขันนี้ในระบบ" };
    }

    const compName = compDoc.data()?.name as string;

    // Collect all docs to delete
    const [groupsSnap, matchesSnap, standingsSnap, bracketSnap] =
      await Promise.all([
        adminDb
          .collection("groups")
          .where("competitionId", "==", competitionId)
          .get(),
        adminDb
          .collection("matches")
          .where("competitionId", "==", competitionId)
          .get(),
        adminDb
          .collection("standings")
          .where("competitionId", "==", competitionId)
          .get(),
        adminDb
          .collection("bracket_matches")
          .where("competitionId", "==", competitionId)
          .get(),
      ]);

    // Gather all refs to delete (including the competition doc itself)
    const allRefs = [
      compRef,
      ...groupsSnap.docs.map((d) => d.ref),
      ...matchesSnap.docs.map((d) => d.ref),
      ...standingsSnap.docs.map((d) => d.ref),
      ...bracketSnap.docs.map((d) => d.ref),
    ];

    // Chunk into batches of 500 (Firestore limit)
    const BATCH_LIMIT = 500;
    for (let i = 0; i < allRefs.length; i += BATCH_LIMIT) {
      const chunk = allRefs.slice(i, i + BATCH_LIMIT);
      const batch = adminDb.batch();
      chunk.forEach((ref) => batch.delete(ref));
      await batch.commit();
    }

    const deletedCount = allRefs.length - 1; // exclude the competition doc
    return {
      success: true,
      message: `ลบรายการ "${compName}" สำเร็จ (ลบข้อมูลที่เกี่ยวข้อง ${deletedCount} รายการ)`,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}
