"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Mail, Phone, MessageCircle, MapPin, CreditCard, QrCode, Edit2, Loader2 } from "lucide-react";
import { ContactSettings, PaymentSettings } from "@/app/actions/admin/settingsActions";

export default function ContactPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [contact, setContact] = useState<ContactSettings | null>(null);
  const [payment, setPayment] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let contactLoaded = false;
    let paymentLoaded = false;

    const checkLoading = () => {
      if (contactLoaded && paymentLoaded) {
        setLoading(false);
      }
    };

    const unsubContact = onSnapshot(doc(db, "settings", "contact"), (snap) => {
      if (snap.exists()) {
        setContact(snap.data() as ContactSettings);
      } else {
        setContact(null);
      }
      contactLoaded = true;
      checkLoading();
    }, (error) => {
      console.error("Error fetching contact settings:", error);
      contactLoaded = true;
      checkLoading();
    });

    const unsubPayment = onSnapshot(doc(db, "settings", "payment"), (snap) => {
      if (snap.exists()) {
        setPayment(snap.data() as PaymentSettings);
      } else {
        setPayment(null);
      }
      paymentLoaded = true;
      checkLoading();
    }, (error) => {
      console.error("Error fetching payment settings:", error);
      paymentLoaded = true;
      checkLoading();
    });

    return () => {
      unsubContact();
      unsubPayment();
    };
  }, []);

  return (
    <div className="pt-16 min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative">
        {isAdmin && (
          <Link
            href="/admin/settings"
            className="absolute top-20 right-6 inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            <Edit2 size={12} />
            Edit Settings
          </Link>
        )}
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          Contact Us
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-6">ติดต่อสอบถาม & ชำระเงิน</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
          มีข้อสงสัยเกี่ยวกับการแข่งขัน สนใจแพ็กเกจช่างภาพ หรือสั่งซื้อสินค้า สามารถติดต่อเราได้ผ่านช่องทางด้านล่างนี้
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Contact Info */}
        <div className="flex flex-col gap-8">
          <h3 className="text-lg font-semibold text-foreground border-b border-border/40 pb-4">ช่องทางการติดต่อ</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center shrink-0">
                  <MessageCircle size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Social Media</p>
                  <p className="text-sm font-medium text-foreground">
                    Facebook: {contact?.facebookUrl || <span className="text-muted-foreground italic text-[11px]">ยังไม่ได้ตั้งค่า</span>}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    LINE: {contact?.lineId || <span className="text-muted-foreground italic text-[11px]">ยังไม่ได้ตั้งค่า</span>}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Phone</p>
                  <p className="text-sm font-medium text-foreground">
                    {contact?.phone || <span className="text-muted-foreground italic text-[11px]">ยังไม่ได้ตั้งค่า</span>}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Email</p>
                  <p className="text-sm font-medium text-foreground">
                    contact@amtournament.com
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Address</p>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    สนามกีฬากลางจังหวัดสตูล เลขที่ 1 ถนนสฤษดิ์ภูมินารถ ต.พิมาน อ.เมือง จ.สตูล 91000
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-card border border-border/40 p-8 rounded-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <CreditCard size={20} className="text-primary" /> ข้อมูลการชำระเงิน
          </h3>
          
          {loading ? (
             <div className="flex items-center justify-center py-12 text-muted-foreground">
               <Loader2 className="w-6 h-6 animate-spin" />
             </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="bg-muted/30 p-4 rounded-sm border border-border/40">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">PromptPay / หมายเลขบัญชี</p>
                <p className="text-lg font-bold text-foreground mb-1">
                  {payment?.promptPayNumber || <span className="text-muted-foreground italic text-sm">ยังไม่ได้ตั้งค่า</span>}
                </p>
                <p className="text-sm text-foreground">
                  ชื่อบัญชี: {payment?.accountName || <span className="text-muted-foreground italic">ยังไม่ได้ตั้งค่า</span>}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center pt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">สแกน QR Code เพื่อชำระเงิน</p>
                
                {payment?.qrCodeUrl ? (
                  <div className="p-2 bg-white rounded-md w-48 h-48 flex items-center justify-center border border-border">
                    <img src={payment.qrCodeUrl} alt="Payment QR Code" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-muted border border-border/40 rounded-md flex flex-col items-center justify-center text-muted-foreground">
                    <QrCode size={40} className="mb-2 opacity-50" />
                    <span className="text-[10px] uppercase tracking-widest">ยังไม่ได้ตั้งค่า QR Code</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
