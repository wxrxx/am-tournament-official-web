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

// ─── Types ──────────────────────────────────────────────────────
export interface WebsiteSettings {
  siteName: string;
  siteDescription: string;
  siteLogo: string;
}

export interface ContactSettings {
  phone: string;
  facebookUrl: string;
  lineId: string;
}

export interface PaymentSettings {
  promptPayNumber: string;
  accountName: string;
  qrCodeUrl: string;
}

export interface AboutSettings {
  orgName: string;
  shortDescription: string;
  history: string;
  imageUrl: string;
}

export interface AllSettings {
  website: WebsiteSettings;
  contact: ContactSettings;
  payment: PaymentSettings;
  about: AboutSettings;
}

// ─── Action 1: Get All Settings ─────────────────────────────────
export async function getSettings(
  currentUid: string
): Promise<{
  success: boolean;
  message: string;
  settings: AllSettings;
}> {
  try {
    await verifyAdmin(currentUid);

    const [websiteSnap, contactSnap, paymentSnap, aboutSnap] = await Promise.all([
      adminDb.collection("settings").doc("website").get(),
      adminDb.collection("settings").doc("contact").get(),
      adminDb.collection("settings").doc("payment").get(),
      adminDb.collection("settings").doc("about").get(),
    ]);

    const website: WebsiteSettings = {
      siteName: (websiteSnap.data()?.siteName as string) ?? "AM Tournament",
      siteDescription: (websiteSnap.data()?.siteDescription as string) ?? "",
      siteLogo: (websiteSnap.data()?.siteLogo as string) ?? "",
    };

    const contact: ContactSettings = {
      phone: (contactSnap.data()?.phone as string) ?? "",
      facebookUrl: (contactSnap.data()?.facebookUrl as string) ?? "",
      lineId: (contactSnap.data()?.lineId as string) ?? "",
    };

    const payment: PaymentSettings = {
      promptPayNumber: (paymentSnap.data()?.promptPayNumber as string) ?? "",
      accountName: (paymentSnap.data()?.accountName as string) ?? "",
      qrCodeUrl: (paymentSnap.data()?.qrCodeUrl as string) ?? "",
    };

    const about: AboutSettings = {
      orgName: (aboutSnap.data()?.orgName as string) ?? "AM Tournament",
      shortDescription: (aboutSnap.data()?.shortDescription as string) ?? "",
      history: (aboutSnap.data()?.history as string) ?? "",
      imageUrl: (aboutSnap.data()?.imageUrl as string) ?? "",
    };

    return { success: true, message: "", settings: { website, contact, payment, about } };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return {
      success: false,
      message: msg,
      settings: {
        website: { siteName: "", siteDescription: "", siteLogo: "" },
        contact: { phone: "", facebookUrl: "", lineId: "" },
        payment: { promptPayNumber: "", accountName: "", qrCodeUrl: "" },
        about: { orgName: "", shortDescription: "", history: "", imageUrl: "" },
      },
    };
  }
}

// ─── Action 2: Update Website Settings ──────────────────────────
export async function updateWebsiteSettings(
  currentUid: string,
  data: WebsiteSettings
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    await adminDb.collection("settings").doc("website").set(
      { ...data, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    return { success: true, message: "บันทึกข้อมูลเว็บไซต์เรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 3: Update Contact Settings ──────────────────────────
export async function updateContactSettings(
  currentUid: string,
  data: ContactSettings
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    await adminDb.collection("settings").doc("contact").set(
      { ...data, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    return { success: true, message: "บันทึกข้อมูลติดต่อเรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 4: Update Payment Settings ──────────────────────────
export async function updatePaymentSettings(
  currentUid: string,
  data: PaymentSettings
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    await adminDb.collection("settings").doc("payment").set(
      { ...data, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    return { success: true, message: "บันทึกข้อมูลการชำระเงินเรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}

// ─── Action 5: Update About Settings ────────────────────────────
export async function updateAboutSettings(
  currentUid: string,
  data: AboutSettings
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    await adminDb.collection("settings").doc("about").set(
      { ...data, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    return { success: true, message: "บันทึกข้อมูลเกี่ยวกับเราเรียบร้อย" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
    return { success: false, message: msg };
  }
}
