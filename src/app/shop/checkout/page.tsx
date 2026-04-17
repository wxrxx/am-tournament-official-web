"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UploadCloud, ArrowLeft, CheckCircle2, Loader2, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/services/dataService";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const type = searchParams.get("type") ?? "";
  const itemId = searchParams.get("id") ?? "";
  const price = Number(searchParams.get("price") ?? 0);
  const name = searchParams.get("name") ?? `รายการ #${itemId}`;

  const [slipUrl, setSlipUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (type === "photo" && !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-6">
        <Card className="w-full max-w-md text-center border-border/40 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader className="space-y-4 pt-10">
            <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <ShoppingCart size={22} className="text-muted-foreground" strokeWidth={1.5} />
            </div>
            <CardTitle>ต้องเข้าสู่ระบบก่อน</CardTitle>
            <CardDescription>
              กรุณาเข้าสู่ระบบบัญชี AM Tournament เพื่อซื้อภาพถ่ายความละเอียดสูง ไร้ลายน้ำ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-10">
            <Link
              href="/login"
              className={cn(buttonVariants(), "w-full font-bold uppercase tracking-widest text-[11px]")}
            >
              เข้าสู่ระบบ
            </Link>
            <Button variant="ghost" onClick={() => router.back()} className="w-full gap-2">
              <ArrowLeft size={16} /> ย้อนกลับ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-6">
        <Card className="w-full max-w-sm text-center border-border/40 shadow-lg animate-in fade-in zoom-in-95 duration-700">
          <CardHeader className="space-y-4 pt-10">
            <CheckCircle2 size={48} className="text-primary mx-auto" strokeWidth={1.5} />
            <CardTitle className="text-2xl">รับคำสั่งซื้อแล้ว!</CardTitle>
            <CardDescription className="text-sm leading-relaxed px-4">
              ทีมงานได้รับสลิปการโอนเงินของท่านเรียบร้อย ลิงก์ไฟล์ Digital จะถูกส่งไปยังอีเมลภายใน <strong>24–48 ชั่วโมง</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10">
            <Button onClick={() => router.push("/")} className="w-full font-bold uppercase tracking-widest text-[11px]">
              กลับหน้าแรก
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipUrl) {
      toast.error("กรุณาอัปโหลดสลิปโอนเงินก่อนยืนยัน");
      return;
    }
    setSubmitting(true);

    const success = await DataService.submitPaymentSlip(
      { type, itemId, price, name, date: new Date().toISOString() },
      slipUrl
    );

    if (success) {
      setDone(true);
      toast.success("ยืนยันการชำระเงินสำเร็จ!");
    } else {
      toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล", {
        description: "กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ",
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 pt-12 pb-32 animate-in fade-in duration-700">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2 text-muted-foreground mb-10 -ml-2"
      >
        <ArrowLeft size={16} /> ย้อนกลับ
      </Button>

      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-12">ยืนยันการชำระเงิน</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Order Summary */}
        <div className="space-y-6">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-muted-foreground">Order Summary</p>
          <Card className="border-border/40">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest text-primary border-primary/30 bg-primary/5 px-3 py-1">
                  {type}
                </Badge>
                <h3 className="text-lg font-bold text-foreground leading-tight">{name}</h3>
              </div>
              <Separator className="bg-border/30" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground font-medium">Total</span>
                <span className="text-3xl font-black text-foreground">{price.toLocaleString()} <span className="text-lg font-bold">฿</span></span>
              </div>
            </CardContent>
          </Card>
          <p className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-border pl-4 opacity-70">
            สินค้าและไฟล์ดิจิทัลทุกชนิดไม่สามารถขอคืนเงินได้หลังชำระแล้ว กรุณาตรวจสอบรายละเอียดก่อนทำการชำระเงิน
          </p>
        </div>

        {/* Payment */}
        <div className="space-y-6">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-muted-foreground">PromptPay Payment</p>

          <Card className="border-border/40">
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                  alt="QR Code PromptPay"
                  className="w-24 h-24 object-contain bg-white p-2 rounded-sm shrink-0 border border-border/20"
                />
                <div className="space-y-2">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">หมายเลขพร้อมเพย์</p>
                  <p className="text-xl font-black text-foreground tracking-widest font-mono">081-234-5678</p>
                  <p className="text-[11px] text-muted-foreground">ชื่อบัญชี: บจก. เอเอ็ม ทัวร์นาเมนต์</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm font-bold text-foreground">แนบสลิปโอนเงิน</p>

            <CldUploadWidget
              signatureEndpoint="/api/sign-cloudinary-params"
              onSuccess={(result: any) => {
                setSlipUrl(result.info.secure_url);
                toast.success("อัปโหลดสลิปสำเร็จ!");
              }}
              onClose={() => {
                document.body.style.overflow = "auto";
                document.documentElement.style.overflow = "auto";
              }}
              options={{
                maxFiles: 1,
                folder: "slips",
                clientAllowedFormats: ["jpg", "png", "pdf"],
              }}
            >
              {({ open }) => (
                <div
                  onClick={() => open()}
                  className={cn(
                    "relative flex flex-col items-center justify-center border-2 border-dashed rounded-sm p-10 cursor-pointer transition-all duration-300",
                    slipUrl
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/50 bg-muted/10 hover:border-primary/40 hover:bg-primary/5"
                  )}
                >
                  <UploadCloud
                    size={26}
                    className={cn("mb-3 transition-colors", slipUrl ? "text-primary" : "text-muted-foreground")}
                    strokeWidth={1.5}
                  />
                  <span className="text-sm font-medium text-center">
                    {slipUrl ? (
                      <span className="text-primary font-bold">✓ อัปโหลดสลิปเรียบร้อยแล้ว</span>
                    ) : (
                      <span className="text-muted-foreground">คลิกเพื่ออัปโหลดสลิป (.jpg, .png, .pdf)</span>
                    )}
                  </span>
                </div>
              )}
            </CldUploadWidget>

            <Button
              type="submit"
              disabled={submitting || !slipUrl}
              className="w-full h-12 font-bold uppercase tracking-widest text-[11px] rounded-sm"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  กำลังดำเนินการ…
                </>
              ) : (
                "ยืนยันการชำระเงิน"
              )}
            </Button>
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
          <div className="pt-32 flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="animate-spin text-primary" size={28} />
            <p className="text-sm uppercase tracking-widest font-medium">กำลังโหลด...</p>
          </div>
        }
      >
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
