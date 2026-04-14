"use client";

import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="pt-16 min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          Contact Us
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-6">ติดต่อสอบถาม</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
          มีข้อสงสัยเกี่ยวกับการแข่งขัน สนใจแพ็กเกจช่างภาพ หรือสั่งซื้อสินค้า สามารถติดต่อเราได้ผ่านช่องทางด้านล่างนี้
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Info */}
        <div className="flex flex-col gap-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Social Media</p>
              <p className="text-sm font-medium text-foreground">Facebook: AM Tournament</p>
              <p className="text-sm font-medium text-foreground">LINE: @amtournament</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center shrink-0">
              <Mail size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Email</p>
              <p className="text-sm font-medium text-foreground">contact@amtournament.com</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center shrink-0">
              <Phone size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Phone</p>
              <p className="text-sm font-medium text-foreground">081-234-5678</p>
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
        </div>

        {/* Simple Form Placeholder */}
        <div className="bg-card border border-border/40 p-8 rounded-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">ส่งข้อความหาเรา</h3>
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] text-muted-foreground uppercase">ชื่อ-นามสกุล</label>
              <input type="text" className="bg-background border border-border/40 p-3 rounded-sm text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] text-muted-foreground uppercase">อีเมล</label>
              <input type="email" className="bg-background border border-border/40 p-3 rounded-sm text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] text-muted-foreground uppercase">ข้อความ</label>
              <textarea rows={4} className="bg-background border border-border/40 p-3 rounded-sm text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <button className="w-full py-3 bg-primary text-black text-sm font-semibold rounded-sm hover:bg-primary/90 transition-colors mt-2">
              ส่งข้อความ
            </button>
          </form>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="max-w-4xl mx-auto px-6 mt-20">
        <div className="aspect-[21/9] bg-muted rounded-sm flex items-center justify-center text-muted-foreground text-xs uppercase tracking-[0.2em] border border-border/40">
           Staging Google Maps Location
        </div>
      </div>
    </div>
  );
}
