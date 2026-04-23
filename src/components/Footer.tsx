"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const { isSignedIn, user } = useAuth();

  return (
    <footer className="border-t border-border/40 py-20 bg-card/30 backdrop-blur-sm animate-in fade-in duration-1000">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-16 mb-20">
          {/* Brand */}
          <div className="max-w-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-[12px] font-bold text-black leading-none">
                AM
              </div>
              <span className="font-bold text-sm tracking-[0.2em] uppercase text-foreground">AM Tournament</span>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              สถาบันทัวร์นาเมนต์ฟุตบอลชั้นนำของจังหวัดสตูล มุ่งสู่ความเป็นเลิศด้วยมาตรฐานระดับสากล ผ่านการนำเสนอสื่อกีฬาที่ทันสมัยและการจัดการแข่งขันที่เป็นมืออาชีพ
            </p>
          </div>

          {/* Links Grid */}
          <div className="flex flex-wrap gap-x-20 gap-y-12">
            <div className="space-y-6 min-w-[120px]">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Competition</p>
              <ul className="space-y-4">
                {[
                  { name: "ตารางแข่งขัน", href: "/schedule" },
                  { name: "สโมสรและรายชื่อทีม", href: "/teams" },
                  { name: "ข่าวสารล่าสุด", href: "/news" },
                  { name: "ผลการแข่งขันสด", href: "/results" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[13px] text-muted-foreground hover:text-foreground transition-all hover:translate-x-1 inline-block">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6 min-w-[120px]">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary">Services</p>
              <ul className="space-y-4">
                {[
                  { name: "แกลเลอรี่รูปภาพ", href: "/gallery" },
                  { name: "ร้านค้าทางการ", href: "/shop" },
                  { name: "แพ็กเกจจองช่างภาพ", href: "/team-package" },
                  { name: "เกี่ยวกับเรา", href: "/about" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[13px] text-muted-foreground hover:text-foreground transition-all hover:translate-x-1 inline-block">
                      {l.name}
                    </Link>
                  </li>
                ))}
                {user?.role === "admin" && (
                  <li>
                    <Link href="/admin" className="text-[13px] text-primary font-bold hover:underline transition-all flex items-center gap-2">
                       Control Panel
                       <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <Separator className="bg-border/20 mb-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} AM Tournament. All rights defined.
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
