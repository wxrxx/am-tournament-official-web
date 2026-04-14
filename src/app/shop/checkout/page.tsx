"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UploadCloud, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/services/dataService";

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const type = searchParams.get("type") ?? "";
  const itemId = searchParams.get("id") ?? "";
  const price = Number(searchParams.get("price") ?? 0);
  const name = searchParams.get("name") ?? `รายการ #${itemId}`;

  const [slip, setSlip] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (type === "photo" && !isSignedIn) {
    return (
      <div className="text-center py-24 max-w-sm mx-auto">
        <h2 className="text-lg font-semibold text-foreground mb-3">ต้องเข้าสู่ระบบก่อน</h2>
        <p className="text-sm text-muted-foreground mb-6">
          กรุณาเข้าสู่ระบบบัญชี AM Tournament เพื่อซื้อภาพถ่ายความละเอียดสูง
        </p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-foreground text-background text-sm font-semibold rounded-sm hover:opacity-85 transition-opacity"
        >
          ย้อนกลับ
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-24 max-w-sm mx-auto">
        <CheckCircle2 size={40} className="text-primary mx-auto mb-6" strokeWidth={1.5} />
        <h2 className="text-xl font-semibold text-foreground mb-3">รับคำสั่งซื้อแล้ว</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">
          ทีมงานได้รับสลิปของท่านเรียบร้อย ลิงก์ไฟล์ Digital จะถูกส่งไปยังอีเมลภายใน 24–48 ชั่วโมง
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-foreground text-background text-sm font-semibold rounded-sm hover:opacity-85 transition-opacity"
        >
          กลับหน้าแรก
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slip) return alert("กรุณาอัปโหลดสลิปโอนเงิน");
    setSubmitting(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result?.toString() ?? "";
      await DataService.submitPaymentSlip({ type, itemId, price, name, date: new Date().toISOString() }, base64);
      setDone(true);
      setSubmitting(false);
    };
    reader.readAsDataURL(slip);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-14 pb-24">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-12"
      >
        <ArrowLeft size={16} strokeWidth={1.5} /> ย้อนกลับ
      </button>

      <h1 className="text-xl font-semibold text-foreground mb-12">ยืนยันการชำระเงิน</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Summary */}
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-6">
            สรุปคำสั่งซื้อ
          </p>
          <div className="pb-6 mb-6 border-b border-border/50">
            <p className="text-[11px] text-primary uppercase tracking-wider font-semibold mb-2">{type}</p>
            <h3 className="text-base font-medium text-foreground leading-snug mb-5">{name}</h3>
            <p className="text-2xl font-semibold text-foreground">{price.toLocaleString()} ฿</p>
          </div>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            สินค้าและไฟล์ดิจิทัลทุกชนิดไม่สามารถขอคืนเงินได้หลังชำระแล้ว กรุณาตรวจสอบรายการก่อนชำระ
          </p>
        </div>

        {/* Payment */}
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-6">
            โอนเงินผ่านพร้อมเพย์
          </p>

          <div className="flex items-start gap-5 mb-8 p-5 bg-card border border-border/50 rounded-sm">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
              alt="QR Code"
              className="w-24 h-24 object-contain bg-white p-2 rounded-sm shrink-0"
            />
            <div>
              <p className="text-[11px] text-muted-foreground mb-1">หมายเลขพร้อมเพย์</p>
              <p className="text-lg font-semibold text-foreground tracking-widest font-mono mb-3">
                081-234-5678
              </p>
              <p className="text-[11px] text-muted-foreground">ชื่อบัญชี: บจก. เอเอ็ม ทัวร์นาเมนต์</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <p className="text-[13px] font-medium text-foreground mb-3">แนบสลิปโอนเงิน</p>
            <label className="relative flex flex-col items-center justify-center border border-dashed border-border/60 rounded-sm p-8 cursor-pointer hover:bg-muted/20 transition-colors mb-6">
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setSlip(e.target.files?.[0] ?? null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadCloud size={22} className={slip ? "text-primary" : "text-muted-foreground"} strokeWidth={1.5} />
              <span className="text-[13px] text-muted-foreground mt-2">
                {slip ? slip.name : "คลิกเพื่อเลือกไฟล์รูปสลิป"}
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !slip}
              className="w-full py-3.5 bg-foreground text-background text-sm font-semibold rounded-sm hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "กำลังดำเนินการ…" : "ยืนยันการชำระเงิน"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <Suspense
        fallback={
          <div className="pt-32 flex justify-center text-sm text-muted-foreground">
            กำลังโหลด...
          </div>
        }
      >
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
