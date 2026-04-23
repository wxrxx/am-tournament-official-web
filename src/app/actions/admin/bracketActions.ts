"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { BracketMatch } from "@/types/bracket";

// ─── Helper: Verify Admin ──────────────────────────────────────
async function verifyAdmin(currentUid: string): Promise<void> {
  const userDoc = await adminDb.collection("users").doc(currentUid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    throw new Error("ไม่มีสิทธิ์ดำเนินการ: ต้องเป็น Admin เท่านั้น");
  }
}

// ─── Helper: Get Round Name ────────────────────────────────────
function getRoundName(round: number): "RO16" | "QF" | "SF" | "F" {
  if (round === 1) return "RO16";
  if (round === 2) return "QF";
  if (round === 3) return "SF";
  return "F";
}

export interface ActionResult {
  success: boolean;
  message: string;
}

// ─── 1. Generate Bracket ────────────────────────────────────────
export async function generateBracket(
  currentUid: string,
  competitionId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    // 1. Fetch groups and standings
    const [groupsSnap, standingsSnap] = await Promise.all([
      adminDb.collection("groups").where("competitionId", "==", competitionId).get(),
      adminDb.collection("standings").where("competitionId", "==", competitionId).get(),
    ]);

    if (groupsSnap.empty) {
      return { success: false, message: "ไม่พบกลุ่มในการแข่งขันนี้" };
    }

    const groups = groupsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as { id: string; name: string }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const standings = standingsSnap.docs.map((d) => d.data() as any);

    // Get Top 2 of each group
    const groupTop2 = groups.map((g) => {
      const st = standings
        .filter((s) => s.groupId === g.id)
        .sort(
          (a, b) =>
            b.points - a.points ||
            b.goalDiff - a.goalDiff ||
            b.goalsFor - a.goalsFor
        );
      return st.slice(0, 2).map((s) => s.clubId as string);
    });

    const numTeams = groups.length * 2;
    // Calculate starting round (e.g. 16 teams -> round 1 (RO16), 8 teams -> round 2 (QF))
    // Fallback to round 1 if there's a weird number of teams, or cap it.
    const startingRound = Math.max(1, 4 - Math.log2(Math.max(2, numTeams) / 2));

    const batch = adminDb.batch();

    // 2. Delete existing bracket for this competition
    const existingSnap = await adminDb
      .collection("bracket_matches")
      .where("competitionId", "==", competitionId)
      .get();
    existingSnap.docs.forEach((d) => batch.delete(d.ref));

    // 3. Generate matches top-down (from Final down to starting round)
    const allMatches: any[] = [];
    let nextRoundMatches: any[] = [];

    for (let r = 4; r >= startingRound; r--) {
      const numMatchesInRound = Math.pow(2, 4 - r);
      const currentRound: any[] = [];

      for (let i = 0; i < numMatchesInRound; i++) {
        const id = adminDb.collection("bracket_matches").doc().id;
        const match = {
          id,
          competitionId,
          round: r,
          roundName: getRoundName(r),
          position: i + 1,
          homeTeamId: "",
          awayTeamId: "",
          homeScore: 0,
          awayScore: 0,
          winnerId: "",
          status: "scheduled",
          nextMatchId: "",
          venue: "",
        };

        if (r < 4) {
          // Link to the next round (created in previous loop iteration)
          match.nextMatchId = nextRoundMatches[Math.floor(i / 2)].id;
        }

        currentRound.push(match);
        allMatches.unshift(match);
      }
      nextRoundMatches = currentRound;
    }

    // 4. Populate cross-pairings in the starting round matches
    const startingMatches = allMatches.filter((m) => m.round === startingRound);
    let matchIndex = 0;

    for (let i = 0; i < groupTop2.length; i += 2) {
      const g1 = groupTop2[i]; // [1A, 2A]
      const g2 = groupTop2[i + 1] || ["", ""]; // [1B, 2B]

      if (startingMatches[matchIndex]) {
        startingMatches[matchIndex].homeTeamId = g1[0] || ""; // 1A
        startingMatches[matchIndex].awayTeamId = g2[1] || ""; // 2B
      }
      matchIndex++;

      if (startingMatches[matchIndex]) {
        startingMatches[matchIndex].homeTeamId = g2[0] || ""; // 1B
        startingMatches[matchIndex].awayTeamId = g1[1] || ""; // 2A
      }
      matchIndex++;
    }

    // 5. Commit batch
    allMatches.forEach((m) => {
      const ref = adminDb.collection("bracket_matches").doc(m.id);
      batch.set(ref, {
        ...m,
        date: FieldValue.serverTimestamp(), // Initial placeholder date
      });
    });

    await batch.commit();

    return { success: true, message: "สร้างสายการแข่งขัน (Bracket) สำเร็จ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── 2. Update Bracket Result ───────────────────────────────────
export async function updateBracketResult(
  currentUid: string,
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const matchRef = adminDb.collection("bracket_matches").doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      return { success: false, message: "ไม่พบแมตช์นี้ในระบบ" };
    }

    const matchData = matchDoc.data() as BracketMatch;
    
    // Determine winner (assuming no draws in knockout)
    let winnerId = "";
    if (homeScore > awayScore) winnerId = matchData.homeTeamId;
    else if (awayScore > homeScore) winnerId = matchData.awayTeamId;

    const batch = adminDb.batch();

    batch.update(matchRef, {
      homeScore,
      awayScore,
      winnerId,
      status: "completed",
    });

    // Auto-advance winner to next match if exists
    if (winnerId && matchData.nextMatchId) {
      const nextMatchRef = adminDb.collection("bracket_matches").doc(matchData.nextMatchId);
      // ODD position -> homeTeam slot, EVEN position -> awayTeam slot
      if (matchData.position % 2 === 1) {
        batch.update(nextMatchRef, { homeTeamId: winnerId });
      } else {
        batch.update(nextMatchRef, { awayTeamId: winnerId });
      }
    }

    await batch.commit();

    return { success: true, message: "บันทึกผลการแข่งขันและเลื่อนรอบเรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── 3. Update Bracket Status ───────────────────────────────────
export async function updateBracketStatus(
  currentUid: string,
  matchId: string,
  status: "scheduled" | "live" | "completed"
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);
    const matchRef = adminDb.collection("bracket_matches").doc(matchId);
    await matchRef.update({ status });
    return { success: true, message: "อัปเดตสถานะแมตช์สำเร็จ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── 4. Delete Bracket ──────────────────────────────────────────
export async function deleteBracket(
  currentUid: string,
  competitionId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const matchesSnap = await adminDb
      .collection("bracket_matches")
      .where("competitionId", "==", competitionId)
      .get();

    if (matchesSnap.empty) {
      return { success: false, message: "ไม่มีข้อมูลสายการแข่งขันให้ลบ" };
    }

    const batch = adminDb.batch();
    matchesSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    return { success: true, message: "ลบข้อมูลสายการแข่งขันทั้งหมดสำเร็จ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── 5. Get Bracket Matches ─────────────────────────────────────
export async function getBracketMatches(
  competitionId: string
): Promise<BracketMatch[]> {
  try {
    const snap = await adminDb
      .collection("bracket_matches")
      .where("competitionId", "==", competitionId)
      .get();
      
    const matches = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
      } as unknown as BracketMatch;
    });

    // Sort by round ASC, position ASC
    return matches.sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return a.position - b.position;
    });
  } catch (error) {
    console.error("Error fetching bracket matches:", error);
    return [];
  }
}
