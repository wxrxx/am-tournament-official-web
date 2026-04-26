"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue, FieldPath } from "firebase-admin/firestore";
import type { Match, Standing } from "@/types/match";

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

// ─── Standings Document ID convention ──────────────────────────
function standingDocId(
  competitionId: string,
  groupId: string,
  clubId: string
): string {
  return `${competitionId}_${groupId}_${clubId}`;
}

// ─── Recalculate standings for a single club in a group ─────────
// Fetches all completed matches for this club in this group and
// recomputes stats from scratch to ensure accuracy.
async function recalculateStanding(
  batch: FirebaseFirestore.WriteBatch,
  competitionId: string,
  groupId: string,
  clubId: string
): Promise<void> {
  // Fetch all completed matches in this group where club is involved
  const [homeSnap, awaySnap] = await Promise.all([
    adminDb
      .collection("matches")
      .where("competitionId", "==", competitionId)
      .where("groupId", "==", groupId)
      .where("homeTeamId", "==", clubId)
      .where("status", "==", "completed")
      .get(),
    adminDb
      .collection("matches")
      .where("competitionId", "==", competitionId)
      .where("groupId", "==", groupId)
      .where("awayTeamId", "==", clubId)
      .where("status", "==", "completed")
      .get(),
  ]);

  let played = 0;
  let won = 0;
  let drawn = 0;
  let lost = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  homeSnap.docs.forEach((d) => {
    const data = d.data();
    const hs = data.homeScore as number;
    const as_ = data.awayScore as number;
    played++;
    goalsFor += hs;
    goalsAgainst += as_;
    if (hs > as_) won++;
    else if (hs === as_) drawn++;
    else lost++;
  });

  awaySnap.docs.forEach((d) => {
    const data = d.data();
    const hs = data.homeScore as number;
    const as_ = data.awayScore as number;
    played++;
    goalsFor += as_;
    goalsAgainst += hs;
    if (as_ > hs) won++;
    else if (as_ === hs) drawn++;
    else lost++;
  });

  const goalDiff = goalsFor - goalsAgainst;
  const points = won * 3 + drawn;

  const standing: Standing = {
    competitionId,
    groupId,
    clubId,
    played,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    goalDiff,
    points,
  };

  const docId = standingDocId(competitionId, groupId, clubId);
  const ref = adminDb.collection("standings").doc(docId);
  batch.set(ref, standing, { merge: true });
}

// ─── Action 1: Create Match ─────────────────────────────────────
export async function createMatch(
  currentUid: string,
  data: Omit<Match, "id">
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    if (data.homeTeamId === data.awayTeamId) {
      return { success: false, message: "ทีมเหย้าและทีมเยือนต้องเป็นคนละทีม" };
    }

    await adminDb.collection("matches").add({
      ...data,
      homeScore: 0,
      awayScore: 0,
      status: "scheduled",
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "สร้างแมตช์เรียบร้อยแล้ว" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 2: Update Match Result ─────────────────────────────
export async function updateMatchResult(
  currentUid: string,
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const matchRef = adminDb.collection("matches").doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      return { success: false, message: "ไม่พบแมตช์นี้ในระบบ" };
    }

    const matchData = matchDoc.data() as Omit<Match, "id">;
    const { competitionId, groupId, homeTeamId, awayTeamId } = matchData;

    // Update match document
    await matchRef.update({
      homeScore,
      awayScore,
      status: "completed",
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Recalculate standings for both teams
    const batch = adminDb.batch();
    await Promise.all([
      recalculateStanding(batch, competitionId, groupId, homeTeamId),
      recalculateStanding(batch, competitionId, groupId, awayTeamId),
    ]);
    await batch.commit();

    return { success: true, message: "บันทึกผลและอัปเดตตารางคะแนนเรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 3: Update Match Status ─────────────────────────────
export async function updateMatchStatus(
  currentUid: string,
  matchId: string,
  status: "scheduled" | "live" | "completed" | "postponed"
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const matchRef = adminDb.collection("matches").doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      return { success: false, message: "ไม่พบแมตช์นี้ในระบบ" };
    }

    await matchRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "อัปเดตสถานะแมตช์เรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 4: Delete Match ─────────────────────────────────────
export async function deleteMatch(
  currentUid: string,
  matchId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const matchRef = adminDb.collection("matches").doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      return { success: false, message: "ไม่พบแมตช์นี้ในระบบ" };
    }

    const matchData = matchDoc.data() as Omit<Match, "id">;
    const { competitionId, groupId, homeTeamId, awayTeamId, status } = matchData;

    // Delete match
    await matchRef.delete();

    // Recalculate standings only if this match was completed
    if (status === "completed") {
      const batch = adminDb.batch();
      await Promise.all([
        recalculateStanding(batch, competitionId, groupId, homeTeamId),
        recalculateStanding(batch, competitionId, groupId, awayTeamId),
      ]);
      await batch.commit();
    }

    return { success: true, message: "ลบแมตช์เรียบร้อยแล้ว" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 5: Get Matches ──────────────────────────────────────
export async function getMatches(
  currentUid: string,
  competitionId: string,
  groupId?: string
): Promise<{ success: boolean; message: string; matches: Match[] }> {
  try {
    await verifyAdmin(currentUid);

    let q = adminDb
      .collection("matches")
      .where("competitionId", "==", competitionId)
      .orderBy("date", "asc");

    if (groupId) {
      q = adminDb
        .collection("matches")
        .where("competitionId", "==", competitionId)
        .where("groupId", "==", groupId)
        .orderBy("date", "asc");
    }

    const snap = await q.get();
    const matches: Match[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Match, "id">),
    }));

    return { success: true, message: "", matches };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg, matches: [] };
  }
}

// ─── Action 6: Get Groups for a Competition ─────────────────────
export async function getGroupsForCompetition(
  currentUid: string,
  competitionId: string
): Promise<{
  success: boolean;
  message: string;
  groups: { id: string; name: string; teamIds: string[] }[];
}> {
  try {
    await verifyAdmin(currentUid);

    const snap = await adminDb
      .collection("groups")
      .where("competitionId", "==", competitionId)
      .orderBy("name", "asc")
      .get();

    const groups = snap.docs.map((d) => ({
      id: d.id,
      name: d.data().name as string,
      teamIds: (d.data().teamIds as string[]) ?? [],
    }));

    return { success: true, message: "", groups };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg, groups: [] };
  }
}

// ─── Action 7: Get Clubs by IDs (chunked) ───────────────────────
export async function getClubsByIds(
  currentUid: string,
  clubIds: string[]
): Promise<{
  success: boolean;
  message: string;
  clubs: { id: string; name: string; logo: string }[];
}> {
  try {
    await verifyAdmin(currentUid);

    if (clubIds.length === 0) {
      return { success: true, message: "", clubs: [] };
    }

    const chunks: string[][] = [];
    for (let i = 0; i < clubIds.length; i += 30) {
      chunks.push(clubIds.slice(i, i + 30));
    }

    const results: { id: string; name: string; logo: string }[] = [];

    await Promise.all(
      chunks.map(async (chunk) => {
        const snap = await adminDb
          .collection("clubs")
          .where(FieldPath.documentId(), "in", chunk)
          .get();
        snap.docs.forEach((d) => {
          results.push({
            id: d.id,
            name: (d.data().name as string) ?? "",
            logo: (d.data().logo as string) ?? "",
          });
        });
      })
    );

    return { success: true, message: "", clubs: results };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg, clubs: [] };
  }
}

// ─── Action 8: Get Competitions ─────────────────────────────────
export async function getCompetitions(currentUid: string): Promise<{
  success: boolean;
  message: string;
  competitions: { id: string; name: string; status: string }[];
}> {
  try {
    await verifyAdmin(currentUid);

    const snap = await adminDb
      .collection("competitions")
      .orderBy("createdAt", "desc")
      .get();

    const competitions = snap.docs.map((d) => ({
      id: d.id,
      name: (d.data().name as string) ?? "",
      status: (d.data().status as string) ?? "Open",
    }));

    return { success: true, message: "", competitions };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg, competitions: [] };
  }
}

// ─── Action 9: Reset Match Result (back to scheduled) ────────────
export async function resetMatchResult(
  currentUid: string,
  matchId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const matchRef = adminDb.collection("matches").doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      return { success: false, message: "ไม่พบแมตช์นี้ในระบบ" };
    }

    const matchData = matchDoc.data() as Omit<Match, "id">;

    if (matchData.status !== "completed") {
      return { success: false, message: "แมตช์นี้ยังไม่ได้บันทึกผล" };
    }

    const { competitionId, groupId, homeTeamId, awayTeamId } = matchData;

    // Reset match to scheduled with 0-0
    await matchRef.update({
      homeScore: 0,
      awayScore: 0,
      status: "scheduled",
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Recalculate standings for both teams (removing the old result)
    const batch = adminDb.batch();
    await Promise.all([
      recalculateStanding(batch, competitionId, groupId, homeTeamId),
      recalculateStanding(batch, competitionId, groupId, awayTeamId),
    ]);
    await batch.commit();

    return { success: true, message: "รีเซ็ตผลและอัปเดตตารางคะแนนเรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 10: Get Standings for a group ─────────────────────────
export async function getStandings(
  currentUid: string,
  competitionId: string,
  groupId: string
): Promise<{
  success: boolean;
  message: string;
  standings: (Standing & { id: string })[];
}> {
  try {
    await verifyAdmin(currentUid);

    const snap = await adminDb
      .collection("standings")
      .where("competitionId", "==", competitionId)
      .where("groupId", "==", groupId)
      .get();

    const standings = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Standing),
    }));

    // Sort: points DESC → goalDiff DESC → goalsFor DESC
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });

    return { success: true, message: "", standings };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg, standings: [] };
  }
}

// ─── Action 11: Recalculate all standings for a group ─────────────
export async function recalculateGroupStandings(
  currentUid: string,
  competitionId: string,
  groupId: string,
  clubIds: string[]
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    if (clubIds.length === 0) {
      return { success: false, message: "ไม่มีทีมในสายนี้" };
    }

    const batch = adminDb.batch();
    await Promise.all(
      clubIds.map((clubId) =>
        recalculateStanding(batch, competitionId, groupId, clubId)
      )
    );
    await batch.commit();

    return {
      success: true,
      message: `คำนวณตารางคะแนนใหม่สำหรับ ${clubIds.length} ทีมเรียบร้อย`,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}
