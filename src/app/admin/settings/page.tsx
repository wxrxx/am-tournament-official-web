"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getSettings, updateWebsiteSettings, updateContactSettings, updatePaymentSettings, updateAboutSettings,
} from "@/app/actions/admin/settingsActions";
import type { WebsiteSettings, ContactSettings, PaymentSettings, AboutSettings } from "@/app/actions/admin/settingsActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import ImageUpload from "@/components/ui/ImageUpload";
import { Settings, Globe, Phone, CreditCard, Loader2, Save, Info } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Section 1: Website
  const [website, setWebsite] = useState<WebsiteSettings>({ siteName: "", siteDescription: "", siteLogo: "" });
  const [savingWebsite, setSavingWebsite] = useState(false);

  // Section 2: Contact
  const [contact, setContact] = useState<ContactSettings>({ phone: "", facebookUrl: "", lineId: "" });
  const [savingContact, setSavingContact] = useState(false);

  // Section 3: Payment
  const [payment, setPayment] = useState<PaymentSettings>({ promptPayNumber: "", accountName: "", qrCodeUrl: "" });
  const [savingPayment, setSavingPayment] = useState(false);

  // Section 4: About
  const [about, setAbout] = useState<AboutSettings>({ orgName: "", shortDescription: "", history: "", imageUrl: "" });
  const [savingAbout, setSavingAbout] = useState(false);

  useEffect(() => {
    if (!user) return;
    getSettings(user.id).then((r) => {
      if (r.success) {
        setWebsite(r.settings.website);
        setContact(r.settings.contact);
        setPayment(r.settings.payment);
        setAbout(r.settings.about);
      }
      setLoading(false);
    });
  }, [user]);

  const handleSaveWebsite = async () => {
    if (!user) return;
    setSavingWebsite(true);
    const r = await updateWebsiteSettings(user.id, website);
    setSavingWebsite(false);
    if (r.success) toast.success(r.message); else toast.error(r.message);
  };

  const handleSaveContact = async () => {
    if (!user) return;
    setSavingContact(true);
    const r = await updateContactSettings(user.id, contact);
    setSavingContact(false);
    if (r.success) toast.success(r.message); else toast.error(r.message);
  };

  const handleSavePayment = async () => {
    if (!user) return;
    setSavingPayment(true);
    const r = await updatePaymentSettings(user.id, payment);
    setSavingPayment(false);
    if (r.success) toast.success(r.message); else toast.error(r.message);
  };

  const handleSaveAbout = async () => {
    if (!user) return;
    setSavingAbout(true);
    const r = await updateAboutSettings(user.id, about);
    setSavingAbout(false);
    if (r.success) toast.success(r.message); else toast.error(r.message);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
            <Settings size={16} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ตั้งค่า</h1>
        </div>
        <p className="text-muted-foreground text-sm pl-11">จัดการข้อมูลเว็บไซต์, ช่องทางติดต่อ และการชำระเงิน</p>
      </div>

      {/* Section 1: Website */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Globe size={18} className="text-primary" />
          <h2 className="text-lg font-bold">ข้อมูลเว็บไซต์</h2>
        </div>
        <div className="grid gap-4 max-w-lg">
          <div className="space-y-1.5">
            <Label>ชื่อเว็บ</Label>
            <Input value={website.siteName} onChange={(e) => setWebsite((p) => ({ ...p, siteName: e.target.value }))} placeholder="AM Tournament" />
          </div>
          <div className="space-y-1.5">
            <Label>คำอธิบาย</Label>
            <textarea
              value={website.siteDescription}
              onChange={(e) => setWebsite((p) => ({ ...p, siteDescription: e.target.value }))}
              placeholder="เว็บไซต์อย่างเป็นทางการของ AM Tournament..."
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>โลโก้เว็บ</Label>
            <ImageUpload value={website.siteLogo} onUpload={(url) => setWebsite((p) => ({ ...p, siteLogo: url }))} folder="settings" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSaveWebsite} disabled={savingWebsite} className="gap-2">
            {savingWebsite ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} บันทึกข้อมูลเว็บไซต์
          </Button>
        </div>
      </div>

      {/* Section 2: Contact */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Phone size={18} className="text-primary" />
          <h2 className="text-lg font-bold">ข้อมูลติดต่อ</h2>
        </div>
        <div className="grid gap-4 max-w-lg">
          <div className="space-y-1.5">
            <Label>เบอร์โทร</Label>
            <Input value={contact.phone} onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))} placeholder="08x-xxx-xxxx" />
          </div>
          <div className="space-y-1.5">
            <Label>Facebook Page URL</Label>
            <Input value={contact.facebookUrl} onChange={(e) => setContact((p) => ({ ...p, facebookUrl: e.target.value }))} placeholder="https://facebook.com/..." />
          </div>
          <div className="space-y-1.5">
            <Label>Line ID</Label>
            <Input value={contact.lineId} onChange={(e) => setContact((p) => ({ ...p, lineId: e.target.value }))} placeholder="@amtournament" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSaveContact} disabled={savingContact} className="gap-2">
            {savingContact ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} บันทึกข้อมูลติดต่อ
          </Button>
        </div>
      </div>

      {/* Section 3: Payment */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <CreditCard size={18} className="text-primary" />
          <h2 className="text-lg font-bold">PromptPay / การชำระเงิน</h2>
        </div>
        <div className="grid gap-4 max-w-lg">
          <div className="space-y-1.5">
            <Label>เบอร์ PromptPay</Label>
            <Input value={payment.promptPayNumber} onChange={(e) => setPayment((p) => ({ ...p, promptPayNumber: e.target.value }))} placeholder="08x-xxx-xxxx" />
          </div>
          <div className="space-y-1.5">
            <Label>ชื่อบัญชี</Label>
            <Input value={payment.accountName} onChange={(e) => setPayment((p) => ({ ...p, accountName: e.target.value }))} placeholder="ชื่อ-นามสกุล" />
          </div>
          <div className="space-y-1.5">
            <Label>QR Code</Label>
            <ImageUpload value={payment.qrCodeUrl} onUpload={(url) => setPayment((p) => ({ ...p, qrCodeUrl: url }))} folder="settings" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSavePayment} disabled={savingPayment} className="gap-2">
            {savingPayment ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} บันทึกข้อมูลการชำระเงิน
          </Button>
        </div>
      </div>

      {/* Section 4: About */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Info size={18} className="text-primary" />
          <h2 className="text-lg font-bold">เกี่ยวกับเรา</h2>
        </div>
        <div className="grid gap-4 max-w-lg">
          <div className="space-y-1.5">
            <Label>ชื่อองค์กร / ทีมผู้จัด</Label>
            <Input value={about.orgName} onChange={(e) => setAbout((p) => ({ ...p, orgName: e.target.value }))} placeholder="เช่น AM Tournament Official" />
          </div>
          <div className="space-y-1.5">
            <Label>คำอธิบายสั้น</Label>
            <textarea
              value={about.shortDescription}
              onChange={(e) => setAbout((p) => ({ ...p, shortDescription: e.target.value }))}
              placeholder="เป้าหมายหรือสโลแกนสั้นๆ..."
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>ประวัติ / เกี่ยวกับทัวร์นาเมนต์</Label>
            <textarea
              value={about.history}
              onChange={(e) => setAbout((p) => ({ ...p, history: e.target.value }))}
              placeholder="เล่าถึงที่มาหรือประวัติของการจัดงาน..."
              className="w-full min-h-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={6}
            />
          </div>
          <div className="space-y-1.5">
            <Label>รูปภาพ (แนะนำแนวนอน 16:9)</Label>
            <ImageUpload value={about.imageUrl} onUpload={(url) => setAbout((p) => ({ ...p, imageUrl: url }))} folder="settings" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSaveAbout} disabled={savingAbout} className="gap-2">
            {savingAbout ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} บันทึกเกี่ยวกับเรา
          </Button>
        </div>
      </div>
    </div>
  );
}
