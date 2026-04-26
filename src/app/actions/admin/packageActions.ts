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

export interface PackageData {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string;
  features: string[];
  status: "Active" | "Inactive";
  popular: boolean;
}

// ─── Action 1: Get Packages ─────────────────────────────────────
export async function getPackages(
  currentUid: string
): Promise<{
  success: boolean;
  message: string;
  packages: PackageData[];
}> {
  try {
    await verifyAdmin(currentUid);

    const snap = await adminDb.collection("packages").orderBy("price", "asc").get();

    const packages: PackageData[] = snap.docs.map((d) => ({
      id: d.id,
      name: (d.data().name as string) ?? "",
      price: (d.data().price as number) ?? 0,
      unit: (d.data().unit as string) ?? "บาท",
      description: (d.data().description as string) ?? "",
      features: (d.data().features as string[]) ?? [],
      status: (d.data().status as "Active" | "Inactive") ?? "Active",
      popular: (d.data().popular as boolean) ?? false,
    }));

    return { success: true, message: "", packages };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg, packages: [] };
  }
}

// ─── Action 2: Add Package ──────────────────────────────────────
export async function addPackage(
  currentUid: string,
  data: Omit<PackageData, "id">
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    if (!data.name.trim()) {
      return { success: false, message: "กรุณากรอกชื่อแพ็กเกจ" };
    }

    await adminDb.collection("packages").add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "เพิ่มแพ็กเกจเรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 3: Update Package ───────────────────────────────────
export async function updatePackage(
  currentUid: string,
  packageId: string,
  data: Partial<Omit<PackageData, "id">>
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const ref = adminDb.collection("packages").doc(packageId);
    const snap = await ref.get();
    if (!snap.exists) {
      return { success: false, message: "ไม่พบแพ็กเกจนี้" };
    }

    await ref.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "อัปเดตแพ็กเกจเรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 4: Delete Package ───────────────────────────────────
export async function deletePackage(
  currentUid: string,
  packageId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const ref = adminDb.collection("packages").doc(packageId);
    const snap = await ref.get();
    if (!snap.exists) {
      return { success: false, message: "ไม่พบแพ็กเกจนี้" };
    }

    await ref.delete();

    return { success: true, message: "ลบแพ็กเกจเรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}
