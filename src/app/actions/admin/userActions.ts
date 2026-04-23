"use server";

import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import type { ActionResult, UserRole, EditUserPayload } from "@/types/user";
import { FieldValue } from "firebase-admin/firestore";

// ─── Helper: Verify caller is admin ────────────────────────────
async function verifyAdmin(currentUid: string): Promise<void> {
  const userDoc = await adminDb.collection("users").doc(currentUid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    throw new Error("ไม่มีสิทธิ์ดำเนินการ: ต้องเป็น Admin เท่านั้น");
  }
}

function assertNotSelf(currentUid: string, targetUid: string): void {
  if (currentUid === targetUid) {
    throw new Error("ไม่สามารถดำเนินการกับบัญชีตัวเองได้");
  }
}

// ─── Action 1: Change User Role ────────────────────────────────
export async function changeUserRole(
  currentUid: string,
  targetUid: string,
  newRole: UserRole
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);
    assertNotSelf(currentUid, targetUid);

    await adminDb.collection("users").doc(targetUid).update({
      role: newRole,
    });

    return {
      success: true,
      message: `เปลี่ยน Role เป็น "${newRole}" สำเร็จ`,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 2: Ban User ────────────────────────────────────────
export async function banUser(
  currentUid: string,
  targetUid: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);
    assertNotSelf(currentUid, targetUid);

    // Disable Firebase Auth account
    await adminAuth.updateUser(targetUid, { disabled: true });

    // Update Firestore
    await adminDb.collection("users").doc(targetUid).update({
      banned: true,
    });

    return {
      success: true,
      message: "แบนผู้ใช้สำเร็จ ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 3: Unban User ──────────────────────────────────────
export async function unbanUser(
  currentUid: string,
  targetUid: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);
    assertNotSelf(currentUid, targetUid);

    // Enable Firebase Auth account
    await adminAuth.updateUser(targetUid, { disabled: false });

    // Update Firestore
    await adminDb.collection("users").doc(targetUid).update({
      banned: false,
    });

    return {
      success: true,
      message: "ปลดแบนสำเร็จ ผู้ใช้สามารถเข้าสู่ระบบได้แล้ว",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 4: Edit User ──────────────────────────────────────
export async function editUser(
  currentUid: string,
  targetUid: string,
  data: EditUserPayload
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    // Validate
    if (!data.displayName.trim()) {
      return { success: false, message: "ชื่อผู้ใช้ต้องไม่เป็นค่าว่าง" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, message: "รูปแบบอีเมลไม่ถูกต้อง" };
    }

    // Update Firebase Auth profile
    await adminAuth.updateUser(targetUid, {
      displayName: data.displayName.trim(),
      email: data.email.trim(),
    });

    // Update Firestore
    await adminDb.collection("users").doc(targetUid).update({
      displayName: data.displayName.trim(),
      email: data.email.trim(),
    });

    return {
      success: true,
      message: "อัปเดตข้อมูลผู้ใช้สำเร็จ",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 5: Delete User ────────────────────────────────────
export async function deleteUser(
  currentUid: string,
  targetUid: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);
    assertNotSelf(currentUid, targetUid);

    // 1. Delete subcollection: orders (query top-level by userId)
    const ordersSnap = await adminDb
      .collection("orders")
      .where("userId", "==", targetUid)
      .get();
    const orderBatch = adminDb.batch();
    ordersSnap.docs.forEach((doc) => orderBatch.delete(doc.ref));
    if (!ordersSnap.empty) await orderBatch.commit();

    // 2. Delete subcollection: team_registrations (query by email)
    const userDoc = await adminDb.collection("users").doc(targetUid).get();
    const userEmail = userDoc.data()?.email as string | undefined;
    if (userEmail) {
      const regsSnap = await adminDb
        .collection("team_registrations")
        .where("email", "==", userEmail)
        .get();
      const regBatch = adminDb.batch();
      regsSnap.docs.forEach((doc) => regBatch.delete(doc.ref));
      if (!regsSnap.empty) await regBatch.commit();
    }

    // 3. Delete Firestore user document
    await adminDb.collection("users").doc(targetUid).delete();

    // 4. Delete Firebase Auth account
    await adminAuth.deleteUser(targetUid);

    return {
      success: true,
      message: "ลบผู้ใช้ออกจากระบบสำเร็จ",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}
