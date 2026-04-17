"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DataService, Competition } from "@/services/dataService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Users,
  Calendar,
  Banknote,
  Shield,
  ArrowLeft,
  CheckCircle2,
  Upload,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface FormState {
  teamName: string;
  managerName: string;
  phone: string;
  email: string;
  logoUrl: string;
  slipUrl: string;
}

const emptyForm: FormState = {
  teamName: "",
  managerName: "",
  phone: "",
  email: "",
  logoUrl: "",
  slipUrl: "",
};

export default function RegisterTeamPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Competition | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const slipInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
      const data = await res.json();
      if (data.secure_url) {
        field("logoUrl", data.secure_url);
        toast.success("อัปโหลดโลโก้สำเร็จ");
      } else throw new Error(data.error || "Upload failed");
    } catch (err) {
      console.error(err);
      toast.error("อัปโหลดโลโก้ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSlip(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-slip", { method: "POST", body: formData });
      const data = await res.json();
      if (data.secure_url) {
        field("slipUrl", data.secure_url);
        toast.success("อัปโหลดสลิปสำเร็จ");
      } else throw new Error(data.error || "Upload failed");
    } catch (err) {
      console.error(err);
      toast.error("อัปโหลดสลิปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setUploadingSlip(false);
      if (slipInputRef.current) slipInputRef.current.value = "";
    }
  };

  const fetchComps = useCallback(async () => {
    setLoading(true);
    const all = await DataService.getCompetitions();
    setCompetitions(all.filter((c) => c.status === "Open"));
    setLoading(false);
  }, []);

  useEffect(() => { fetchComps(); }, [fetchComps]);

  const field = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teamName.trim()) { toast.error("กรุณากรอกชื่อทีม"); return; }
    if (!form.managerName.trim()) { toast.error("กรุณากรอกชื่อผู้จัดการทีม"); return; }
    if (!form.phone.trim()) { toast.error("กรุณากรอกเบอร์โทรศัพท์"); return; }
    if (!form.email.trim() || !form.email.includes("@")) { toast.error("กรุณากรอกอีเมลให้ถูกต้อง"); return; }
    if (!form.logoUrl) { toast.error("กรุณาอัปโหลดโลโก้ทีม"); return; }
    if (!form.slipUrl) { toast.error("กรุณาอัปโหลดสลิปการชำระเงิน"); return; }
    if (!selected) return;

    setSubmitting(true);
    const ok = await DataService.submitRegistration({
      competitionId: selected.id,
      teamName: form.teamName,
      managerName: form.managerName,
      phone: form.phone,
      email: form.email,
      logoUrl: form.logoUrl,
      slipUrl: form.slipUrl,
    });
    setSubmitting(false);

    if (ok) {
      setDone(true);
    } else {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ─── Success State ────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">สมัครสำเร็จ!</h1>
          <p className="text-muted-foreground max-w-md">
            ใบสมัครของทีม <span className="text-foreground font-semibold">{form.teamName}</span> ถูกส่งไปยังระบบเรียบร้อยแล้ว
            เจ้าหน้าที่จะดำเนินการตรวจสอบภายใน 24–48 ชั่วโมง
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => { setDone(false); setSelected(null); setForm(emptyForm); }}
          >
            สมัครรายการอื่น
          </Button>
          <a href="/" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-black hover:bg-primary/90 h-10 px-4 py-2">
            กลับหน้าหลัก
          </a>
        </div>
      </div>
    );
  }

  // ─── Step 2: Registration Form ────────────────────────────────────────────
  if (selected) {
    return (
      <div className="pt-20 pb-24 px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => { setSelected(null); setForm(emptyForm); }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-10"
        >
          <ArrowLeft size={16} /> เลือกรายการใหม่
        </button>

        <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">
          {/* Left: Form */}
          <div className="space-y-8">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">สมัครทีม</p>
              <h1 className="text-3xl font-bold">{selected.name}</h1>
              <p className="text-muted-foreground text-sm">กรอกข้อมูลให้ครบถ้วนเพื่อส่งใบสมัคร</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Team Info */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-widest border-b border-border/40 pb-2">ข้อมูลทีม</h2>
                <div className="space-y-1.5">
                  <Label>ชื่อทีม <span className="text-red-500">*</span></Label>
                  <Input
                    id="teamName"
                    placeholder="ชื่อทีมของคุณ"
                    value={form.teamName}
                    onChange={(e) => field("teamName", e.target.value)}
                  />
                </div>

                {/* Logo Upload */}
                <div className="space-y-1.5">
                  <Label>โลโก้ทีม <span className="text-red-500">*</span></Label>
                  {form.logoUrl ? (
                    <div className="flex items-center gap-4">
                      <img src={form.logoUrl} alt="logo" className="w-16 h-16 rounded-xl object-cover border border-border/40" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-emerald-600">อัปโหลดสำเร็จ ✓</p>
                        <button 
                          type="button" 
                          onClick={() => logoInputRef.current?.click()} 
                          className="text-xs text-muted-foreground hover:text-foreground underline disabled:opacity-50"
                          disabled={uploadingLogo}
                        >
                          {uploadingLogo ? "กำลังอัปโหลด..." : "เปลี่ยนรูป"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all gap-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      {uploadingLogo ? (
                        <>
                          <Loader2 size={20} className="animate-spin text-primary" />
                          <span className="text-sm font-medium">กำลังอัปโหลดโลโก้...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          <span className="text-sm font-medium">คลิกเพื่ออัปโหลดโลโก้ทีม</span>
                          <span className="text-xs opacity-60">ไฟล์ PNG, JPG ขนาดไม่เกิน 5MB</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>

              {/* Manager Info */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-widest border-b border-border/40 pb-2">ข้อมูลผู้จัดการทีม</h2>
                <div className="space-y-1.5">
                  <Label>ชื่อ-นามสกุล ผู้จัดการทีม <span className="text-red-500">*</span></Label>
                  <Input
                    id="managerName"
                    placeholder="ชื่อเต็ม"
                    value={form.managerName}
                    onChange={(e) => field("managerName", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>เบอร์โทรศัพท์ <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08x-xxx-xxxx"
                      value={form.phone}
                      onChange={(e) => field("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>อีเมล <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={form.email}
                      onChange={(e) => field("email", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Slip */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-widest border-b border-border/40 pb-2">หลักฐานการชำระเงิน</h2>
                <div className="rounded-xl border border-border/40 bg-muted/30 p-4 space-y-1">
                  <p className="text-sm font-semibold">ชำระผ่าน PromptPay</p>
                  <p className="text-3xl font-bold tracking-tight">฿{selected.entryFee?.toLocaleString()}</p>
                  <p className="text-muted-foreground text-xs">โอนเงินแล้วแนบสลิปด้านล่าง</p>
                </div>
                <div className="space-y-1.5">
                  <Label>อัปโหลดสลิป <span className="text-red-500">*</span></Label>
                  {form.slipUrl ? (
                    <div className="space-y-2">
                      <img src={form.slipUrl} alt="slip" className="w-full max-h-48 object-contain rounded-xl border border-border/40 bg-muted" />
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-emerald-600">อัปโหลดสำเร็จ ✓</p>
                        <button 
                          type="button" 
                          onClick={() => slipInputRef.current?.click()} 
                          className="text-xs text-muted-foreground hover:text-foreground underline disabled:opacity-50"
                          disabled={uploadingSlip}
                        >
                          {uploadingSlip ? "กำลังอัปโหลด..." : "เปลี่ยนสลิป"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => slipInputRef.current?.click()}
                      disabled={uploadingSlip}
                      className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all gap-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      {uploadingSlip ? (
                        <>
                          <Loader2 size={20} className="animate-spin text-primary" />
                          <span className="text-sm font-medium">กำลังอัปโหลดสลิป...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          <span className="text-sm font-medium">คลิกเพื่ออัปโหลดสลิป</span>
                          <span className="text-xs opacity-60">ไฟล์ PNG, JPG ของสลิปการโอนเงิน</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    ref={slipInputRef}
                    onChange={handleSlipUpload}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full bg-primary text-black hover:bg-primary/90 text-base font-semibold h-12"
              >
                {submitting ? "กำลังส่งใบสมัคร..." : "ส่งใบสมัคร"}
              </Button>
            </form>
          </div>

          {/* Right: Rule Summary */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              <div className="bg-primary/5 border-b border-border/40 px-5 py-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">กฎกติกา</p>
                <p className="font-bold text-lg">{selected.name}</p>
              </div>
              <div className="p-5 space-y-4">
                <RuleRow icon={<Trophy size={15} />} label="ประเภท" value={selected.type} />
                <RuleRow icon={<Users size={15} />} label="จำนวนผู้เล่น/ทีม" value={`${selected.maxPlayers} คน`} />
                <RuleRow icon={<Shield size={15} />} label="จำกัดอายุสูงสุด" value={selected.maxAge?.toString()} />
                <RuleRow icon={<Users size={15} />} label="จำนวนทีมที่รับ" value={`${selected.teamQuota} ทีม`} />
                <RuleRow icon={<Banknote size={15} />} label="ค่าสมัคร" value={`฿${selected.entryFee?.toLocaleString()}`} />
                <RuleRow icon={<Calendar size={15} />} label="เปิดรับสมัครถึง" value={selected.endDate ? new Date(selected.endDate).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-"} />
              </div>
            </div>

            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
              <p className="font-semibold">📌 หมายเหตุ</p>
              <p className="text-xs leading-relaxed opacity-80">
                หลังจากส่งใบสมัครแล้ว เจ้าหน้าที่จะตรวจสอบและแจ้งผลทาง Email ภายใน 24–48 ชั่วโมง
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 1: Competition Selection ───────────────────────────────────────
  return (
    <div className="pt-20 pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest">
          <Trophy size={12} /> สมัครทีมเข้าแข่งขัน
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">เลือกรายการที่ต้องการสมัคร</h1>
        <p className="text-muted-foreground text-base max-w-lg mx-auto">
          คลิกเลือกรายการแข่งขันที่คุณสนใจ เพื่อดูรายละเอียดและกรอกใบสมัคร
        </p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-96 rounded-3xl" />)}
        </div>
      ) : competitions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 gap-6 text-center">
          <div className="w-24 h-24 rounded-full bg-muted/50 border border-border/30 flex items-center justify-center">
            <Trophy size={40} className="text-muted-foreground/50" />
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-bold">ยังไม่มีรายการเปิดรับสมัคร</p>
            <p className="text-muted-foreground max-w-sm leading-relaxed">ขณะนี้ยังไม่มีรายการแข่งขันที่เปิดรับสมัคร<br/>กรุณาติดตามประกาศเร็ว ๆ นี้</p>
          </div>
          <a href="/" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-2">
            กลับหน้าหลัก
          </a>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {competitions.map((comp) => (
            <CompetitionCard key={comp.id} comp={comp} onSelect={() => setSelected(comp)} />
          ))}
        </div>
      )}
    </div>
  );
}

function CompetitionCard({ comp, onSelect }: { comp: Competition; onSelect: () => void }) {
  return (
    <div
      className="group cursor-pointer relative flex flex-col overflow-hidden rounded-2xl border border-border/30 bg-card shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/30 transition-all duration-400"
      onClick={onSelect}
    >
      {/* Top Banner */}
      <div className="relative h-20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center border-b border-border/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
        <div className="absolute top-2 right-2 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            เปิดรับสมัคร
          </span>
        </div>
        {/* Subtle Icon */}
        <Trophy size={32} className="text-primary/40 group-hover:text-primary/60 group-hover:scale-110 transition-all duration-500" strokeWidth={1} />
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <h3 className="text-[15px] leading-snug font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {comp.name}
          </h3>
          <span className="shrink-0 text-muted-foreground text-[9px] font-bold uppercase tracking-widest bg-muted/40 px-1.5 py-0.5 rounded border border-border/30 mt-0.5">
            {comp.type}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-1.5 mt-auto">
          <StatChip icon={<Users size={11} />} label="ทีมละ" value={`${comp.maxPlayers} คน`} />
          <StatChip icon={<Shield size={11} />} label="อายุ" value={comp.maxAge?.toString() ?? "ไม่จำกัด"} />
          <StatChip icon={<Trophy size={11} />} label="รับ" value={`${comp.teamQuota} ทีม`} />
          <StatChip icon={<Banknote size={11} />} label="ค่าสมัคร" value={`฿${comp.entryFee?.toLocaleString()}`} highlight />
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between pt-3.5 border-t border-border/20 mt-3.5">
          <div className="flex flex-col space-y-0.5">
            {comp.endDate ? (
              <>
                <span className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1">
                  ปิดรับ <Calendar size={9} className="opacity-70" />
                </span>
                <span className="text-[11px] font-bold text-foreground">
                  {new Date(comp.endDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                </span>
              </>
            ) : (
                <span className="text-[11px] font-bold text-muted-foreground">เปิดรับสมัคร</span>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="flex items-center gap-1 h-8 px-3 rounded-lg bg-primary text-black font-bold text-[11px] tracking-wide hover:bg-primary/90 transition-all duration-300"
          >
            สมัครเลย
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

function RuleRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon} {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function StatChip({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg bg-muted/20 border border-border/30 px-2.5 py-1.5 flex items-center justify-between group-hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[9px] font-medium">{label}</span>
      </div>
      <p className={`text-[10px] font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
