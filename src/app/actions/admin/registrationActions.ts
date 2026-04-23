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

// ─── Action 1: Approve Registration ───────────────────────────
export async function approveRegistration(
  currentUid: string,
  registrationId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    // 1. Get registration data
    const regRef = adminDb.collection("team_registrations").doc(registrationId);
    const regDoc = await regRef.get();

    if (!regDoc.exists) {
      return { success: false, message: "ไม่พบใบสมัครนี้ในระบบ" };
    }

    const regData = regDoc.data();
    if (!regData) {
      return { success: false, message: "ข้อมูลใบสมัครไม่ถูกต้อง" };
    }

    if (regData.status === "Approved") {
      return { success: false, message: "ใบสมัครนี้ได้รับการอนุมัติแล้ว" };
    }

    // 2. Use batch write for atomicity
    const batch = adminDb.batch();

    // Update registration status
    batch.update(regRef, { status: "Approved" });

    // Create club document
    const clubRef = adminDb.collection("clubs").doc();
    batch.set(clubRef, {
      name: regData.teamName ?? "",
      logo: regData.logoUrl ?? "",
      contactName: regData.managerName ?? "",
      contactPhone: regData.phone ?? "",
      status: "active",
      registrationId: registrationId,
      approvedAt: FieldValue.serverTimestamp(),
      playerCount: 0,
    });

    await batch.commit();

    return {
      success: true,
      message: `อนุมัติทีม "${regData.teamName}" สำเร็จ สโมสรถูกสร้างอัตโนมัติ`,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 2: Reject Registration ────────────────────────────
export async function rejectRegistration(
  currentUid: string,
  registrationId: string,
  reason?: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const regRef = adminDb.collection("team_registrations").doc(registrationId);
    const regDoc = await regRef.get();

    if (!regDoc.exists) {
      return { success: false, message: "ไม่พบใบสมัครนี้ในระบบ" };
    }

    const updateData: Record<string, string> = { status: "Rejected" };
    if (reason?.trim()) {
      updateData.rejectionReason = reason.trim();
    }

    await regRef.update(updateData);

    return {
      success: true,
      message: "ปฏิเสธใบสมัครเรียบร้อยแล้ว",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 3: Update Club ────────────────────────────────────
export async function updateClub(
  currentUid: string,
  clubId: string,
  data: { playerCount?: number; status?: "active" | "inactive" }
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const clubRef = adminDb.collection("clubs").doc(clubId);
    const clubDoc = await clubRef.get();

    if (!clubDoc.exists) {
      return { success: false, message: "ไม่พบสโมสรนี้ในระบบ" };
    }

    const updatePayload: Record<string, string | number> = {};
    if (data.playerCount !== undefined) updatePayload.playerCount = data.playerCount;
    if (data.status !== undefined) updatePayload.status = data.status;

    await clubRef.update(updatePayload);

    return {
      success: true,
      message: "อัปเดตข้อมูลสโมสรสำเร็จ",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 4: Delete Team Registration + Club + Group refs ────
export async function deleteTeamRegistration(
  currentUid: string,
  registrationId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const regRef = adminDb.collection("team_registrations").doc(registrationId);
    const regDoc = await regRef.get();

    if (!regDoc.exists) {
      return { success: false, message: "ไม่พบใบสมัครนี้ในระบบ" };
    }

    const batch = adminDb.batch();

    // 1. Delete the registration
    batch.delete(regRef);

    // 2. Find and delete associated club (if any)
    const clubSnap = await adminDb
      .collection("clubs")
      .where("registrationId", "==", registrationId)
      .get();

    const clubIds: string[] = [];
    clubSnap.docs.forEach((clubDoc) => {
      clubIds.push(clubDoc.id);
      batch.delete(clubDoc.ref);
    });

    // 3. Remove club IDs from any group's teamIds array
    if (clubIds.length > 0) {
      const groupsSnap = await adminDb.collection("groups").get();
      groupsSnap.docs.forEach((groupDoc) => {
        const teamIds = (groupDoc.data().teamIds as string[]) ?? [];
        const filtered = teamIds.filter((id) => !clubIds.includes(id));
        if (filtered.length !== teamIds.length) {
          batch.update(groupDoc.ref, { teamIds: filtered });
        }
      });

      // 4. Delete standings for these clubs
      for (const clubId of clubIds) {
        const standingsSnap = await adminDb
          .collection("standings")
          .where("clubId", "==", clubId)
          .get();
        standingsSnap.docs.forEach((d) => batch.delete(d.ref));
      }

      // 5. Delete matches involving these clubs
      for (const clubId of clubIds) {
        const [homeSnap, awaySnap] = await Promise.all([
          adminDb.collection("matches").where("homeTeamId", "==", clubId).get(),
          adminDb.collection("matches").where("awayTeamId", "==", clubId).get(),
        ]);
        homeSnap.docs.forEach((d) => batch.delete(d.ref));
        awaySnap.docs.forEach((d) => batch.delete(d.ref));
      }

      // 6. Delete bracket_matches involving these clubs
      for (const clubId of clubIds) {
        const [bracketHomeSnap, bracketAwaySnap] = await Promise.all([
          adminDb.collection("bracket_matches").where("homeTeamId", "==", clubId).get(),
          adminDb.collection("bracket_matches").where("awayTeamId", "==", clubId).get(),
        ]);
        bracketHomeSnap.docs.forEach((d) => batch.delete(d.ref));
        bracketAwaySnap.docs.forEach((d) => batch.delete(d.ref));
      }
    }

    await batch.commit();

    return {
      success: true,
      message: "ลบทีมและข้อมูลที่เกี่ยวข้องทั้งหมดเรียบร้อยแล้ว",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 5: Delete Club directly ───────────────────────────
export async function deleteClub(
  currentUid: string,
  clubId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const clubRef = adminDb.collection("clubs").doc(clubId);
    const clubDoc = await clubRef.get();

    if (!clubDoc.exists) {
      return { success: false, message: "ไม่พบสโมสรนี้ในระบบ" };
    }

    const batch = adminDb.batch();

    // 1. Delete club
    batch.delete(clubRef);

    // 2. Delete associated registration (if any)
    const regId = clubDoc.data()?.registrationId as string | undefined;
    if (regId) {
      const regRef = adminDb.collection("team_registrations").doc(regId);
      const regDoc = await regRef.get();
      if (regDoc.exists) batch.delete(regRef);
    }

    // 3. Remove from groups
    const groupsSnap = await adminDb.collection("groups").get();
    groupsSnap.docs.forEach((groupDoc) => {
      const teamIds = (groupDoc.data().teamIds as string[]) ?? [];
      if (teamIds.includes(clubId)) {
        batch.update(groupDoc.ref, { teamIds: teamIds.filter((id) => id !== clubId) });
      }
    });

    // 4. Delete standings
    const standingsSnap = await adminDb
      .collection("standings")
      .where("clubId", "==", clubId)
      .get();
    standingsSnap.docs.forEach((d) => batch.delete(d.ref));

    // 5. Delete matches
    const [homeSnap, awaySnap] = await Promise.all([
      adminDb.collection("matches").where("homeTeamId", "==", clubId).get(),
      adminDb.collection("matches").where("awayTeamId", "==", clubId).get(),
    ]);
    homeSnap.docs.forEach((d) => batch.delete(d.ref));
    awaySnap.docs.forEach((d) => batch.delete(d.ref));

    // 6. Delete bracket_matches involving this club
    const [bracketHomeSnap, bracketAwaySnap] = await Promise.all([
      adminDb.collection("bracket_matches").where("homeTeamId", "==", clubId).get(),
      adminDb.collection("bracket_matches").where("awayTeamId", "==", clubId).get(),
    ]);
    bracketHomeSnap.docs.forEach((d) => batch.delete(d.ref));
    bracketAwaySnap.docs.forEach((d) => batch.delete(d.ref));

    await batch.commit();

    return {
      success: true,
      message: "ลบสโมสรและข้อมูลที่เกี่ยวข้องทั้งหมดเรียบร้อยแล้ว",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}
