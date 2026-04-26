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

export interface OrderData {
  id: string;
  user: string;
  userId?: string;
  type: string;
  item: string;
  price: number;
  status: "Pending" | "Confirmed" | string;
  slipUrl?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
  createdAt?: string;
}

// ─── Action 1: Get Orders ───────────────────────────────────────
export async function getOrders(
  currentUid: string
): Promise<{ success: boolean; message: string; orders: OrderData[] }> {
  try {
    await verifyAdmin(currentUid);

    const snap = await adminDb.collection("orders").orderBy("createdAt", "desc").get();
    
    const orders: OrderData[] = snap.docs.map(doc => {
      const d = doc.data();
      return {
        id: doc.id,
        user: (d.user as string) || (d.userName as string) || "ผู้ใช้ทั่วไป",
        userId: d.userId as string,
        type: (d.type as string) || "GENERAL",
        item: (d.item as string) || (d.packageName as string) || "ไม่มีรายการ",
        price: (d.price as number) || (d.amount as number) || 0,
        status: (d.status as string) || "Pending",
        slipUrl: d.slipUrl as string,
        deletedAt: d.deletedAt ? d.deletedAt.toDate().toISOString() : null,
        deletedBy: d.deletedBy as string | null,
        createdAt: d.createdAt ? d.createdAt.toDate().toISOString() : undefined,
      };
    });

    return { success: true, message: "", orders };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg, orders: [] };
  }
}

// ─── Action 2: Update Order Status ──────────────────────────────
export async function updateOrderStatus(
  currentUid: string,
  orderId: string,
  newStatus: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    await adminDb.collection("orders").doc(orderId).update({
      status: newStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: `อัปเดตสถานะเป็น ${newStatus} สำเร็จ` };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 3: Soft Delete Order ────────────────────────────────
export async function softDeleteOrder(
  currentUid: string,
  orderId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    await adminDb.collection("orders").doc(orderId).update({
      deletedAt: FieldValue.serverTimestamp(),
      deletedBy: currentUid,
    });

    return { success: true, message: "ย้ายคำสั่งซื้อไปที่ถังขยะแล้ว" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 4: Restore Order ────────────────────────────────────
export async function restoreOrder(
  currentUid: string,
  orderId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    await adminDb.collection("orders").doc(orderId).update({
      deletedAt: null,
      deletedBy: null,
    });

    return { success: true, message: "กู้คืนคำสั่งซื้อสำเร็จ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}
