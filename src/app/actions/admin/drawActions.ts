"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import type { CompetitionForDraw, Group } from "@/types/tournament";

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

interface TeamItem {
  id: string;
  name: string;
  logo: string;
}

const ALPHA = ["A", "B", "C", "D", "E", "F", "G", "H"];

// ─── Action 1: Get competitions for draw page ───────────────────
export async function getCompetitionsForDraw(
  currentUid: string
): Promise<{ success: boolean; message: string; competitions: CompetitionForDraw[] }> {
  try {
    await verifyAdmin(currentUid);

    const snap = await adminDb
      .collection("competitions")
      .orderBy("createdAt", "desc")
      .get();

    const competitions: CompetitionForDraw[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: (data.name as string) ?? "",
        status: (data.status as "Open" | "Closed") ?? "Open",
        teamQuota: (data.teamQuota as number) ?? 0,
        numberOfGroups: (data.numberOfGroups as number) ?? 0,
        teamsPerGroup: (data.teamsPerGroup as number) ?? 0,
      };
    });

    return { success: true, message: "", competitions };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg, competitions: [] };
  }
}

// ─── Action 2: Get or create groups for a competition ──────────
export async function getOrCreateGroups(
  currentUid: string,
  competitionId: string,
  numberOfGroups: number
): Promise<{ success: boolean; message: string; groups: Group[] }> {
  try {
    await verifyAdmin(currentUid);

    // Check for existing groups
    const existing = await adminDb
      .collection("groups")
      .where("competitionId", "==", competitionId)
      .get();

    if (!existing.empty) {
      const groups: Group[] = existing.docs
        .map((d) => ({ id: d.id, ...d.data() } as Group))
        .sort((a, b) => a.name.localeCompare(b.name));
      return { success: true, message: "", groups };
    }

    // Create empty groups
    const batch = adminDb.batch();
    const groupNames = ALPHA.slice(0, numberOfGroups);
    const createdGroups: Group[] = [];

    for (const name of groupNames) {
      const ref = adminDb.collection("groups").doc();
      const group: Group = {
        id: ref.id,
        competitionId,
        name,
        teamIds: [],
      };
      batch.set(ref, {
        competitionId,
        name,
        teamIds: [],
      });
      createdGroups.push(group);
    }

    await batch.commit();
    return { success: true, message: "", groups: createdGroups };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg, groups: [] };
  }
}

// ─── Action 3: Get approved teams for a competition ─────────────
export async function getApprovedTeamsForDraw(
  currentUid: string,
  competitionId: string
): Promise<{ success: boolean; message: string; teams: TeamItem[] }> {
  try {
    await verifyAdmin(currentUid);

    const snap = await adminDb
      .collection("team_registrations")
      .where("competitionId", "==", competitionId)
      .where("status", "==", "Approved")
      .get();

    const teams: TeamItem[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: (data.clubId as string) || d.id,
        name: (data.teamName as string) ?? "",
        logo: (data.logoUrl as string) ?? "",
      };
    });

    return { success: true, message: "", teams };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg, teams: [] };
  }
}

// ─── Action 4: Save group draw ──────────────────────────────────
export async function saveGroupDraw(
  currentUid: string,
  competitionId: string,
  assignments: { groupId: string; teamIds: string[] }[]
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    // Validate no duplicates
    const allIds = assignments.flatMap((a) => a.teamIds);
    if (allIds.length !== new Set(allIds).size) {
      return { success: false, message: "พบทีมซ้ำกันในสายต่างๆ กรุณาตรวจสอบ" };
    }

    const batch = adminDb.batch();

    for (const { groupId, teamIds } of assignments) {
      const ref = adminDb.collection("groups").doc(groupId);
      batch.update(ref, { teamIds });
    }

    await batch.commit();

    return { success: true, message: `บันทึกการแบ่งสาย ${assignments.length} สาย สำเร็จ` };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}
