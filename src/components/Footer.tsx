"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Footer() {
  const { isSignedIn } = useAuth();

  return (
    <footer className="border-t border-border/40 py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center text-[11px] font-bold text-black">AM</span>
              <span className="font-semibold text-sm tracking-widest uppercase text-foreground">AM Tournament</span>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              ทัวร์นาเมนต์ฟุตบอลสมัครเล่นที่ยิ่งใหญ่ที่สุดของจังหวัดสตูล เราร่วมยกระดับวงการลูกหนังท้องถิ่นสู่มาตรฐานมืออาชีพ
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-5">ลีก</p>
              <ul className="space-y-3">
                {[
                  { name: "ตารางแข่งขัน", href: "/schedule" },
                  { name: "รายชื่อทีม", href: "/teams" },
                  { name: "ข่าวสาร", href: "/news" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-5">บริการ</p>
              <ul className="space-y-3">
                {[
                  { name: "แกลเลอรี่รูป", href: "/gallery" },
                  { name: "ร้านค้า", href: "/shop" },
                  { name: "จองช่างภาพ", href: "/team-package" },
                  { name: "ติดต่อเรา", href: "/about" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
                      {l.name}
                    </Link>
                  </li>
                ))}
                {isSignedIn && (
                  <li>
                    <Link href="/admin" className="text-[13px] text-primary font-medium hover:opacity-80 transition-opacity flex items-center gap-1.5">
                      จัดการหลังบ้าน
                      <span className="w-1 h-1 bg-primary rounded-full" />
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[12px] text-muted-foreground">
            &copy; {new Date().getFullYear()} AM Tournament — สตูล, ประเทศไทย
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/terms" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
              เงื่อนไขการใช้งาน
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
