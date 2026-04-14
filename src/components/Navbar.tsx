"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, X, Menu } from "lucide-react";

const navLinks = [
  { name: "หน้าแรก", href: "/" },
  { name: "ตารางแข่งขัน", href: "/schedule" },
  { name: "ผลการแข่งขัน", href: "/results" },
  { name: "แกลเลอรี่", href: "/gallery" },
  { name: "สโตร์", href: "/shop" },
  { name: "แพ็กทีม", href: "/team-package" },
  { name: "ข่าวสาร", href: "/news" },
  { name: "สโมสร", href: "/teams" },
  { name: "เกี่ยวกับเรา", href: "/about" },
  { name: "ติดต่อ", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, user, signOut, signIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const handleLogin = () => {
    const email = prompt("อีเมล:");
    const pass = prompt("รหัสผ่าน (am2026):");
    if (email && pass) {
      signIn(email, pass).then((ok) => {
        if (!ok) alert("เข้าสู่ระบบล้มเหลว กรุณาลองใหม่");
      });
    }
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-background/90 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center text-[11px] font-bold text-black leading-none">AM</span>
            <span className="font-semibold text-sm tracking-widest uppercase text-foreground">AM Tournament</span>
          </Link>

          {/* Center nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[13px] transition-colors tracking-wide ${
                  pathname === l.href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.name}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="สลับโหมด"
            >
              {theme === "dark" ? (
                <Sun size={18} strokeWidth={1.5} />
              ) : (
                <Moon size={18} strokeWidth={1.5} />
              )}
            </button>

            {isSignedIn ? (
              <div className="hidden lg:flex items-center gap-4">
                <span className="text-[13px] text-muted-foreground">{user?.fullName}</span>
                <button
                  onClick={signOut}
                  className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="hidden lg:block text-[13px] px-4 py-2 border border-border hover:border-foreground text-foreground transition-colors rounded-sm"
              >
                เข้าสู่ระบบ
              </button>
            )}

            <button
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col">
          <div className="h-16 px-6 flex items-center justify-between border-b border-border/40">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
              <span className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center text-[11px] font-bold text-black">AM</span>
              <span className="font-semibold text-sm tracking-widest uppercase text-foreground">AM Tournament</span>
            </Link>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex flex-col p-6 gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setIsOpen(false)}
                className="py-4 border-b border-border/30 text-lg font-medium text-foreground hover:text-primary transition-colors"
              >
                {l.name}
              </Link>
            ))}
          </nav>
          <div className="p-6 mt-auto">
            {isSignedIn ? (
              <button onClick={() => { signOut(); setIsOpen(false); }}
                className="w-full py-3.5 border border-border rounded-sm text-foreground font-medium text-sm hover:bg-muted transition-colors">
                ออกจากระบบ ({user?.fullName})
              </button>
            ) : (
              <button onClick={() => { handleLogin(); setIsOpen(false); }}
                className="w-full py-3.5 bg-foreground text-background rounded-sm font-medium text-sm hover:opacity-90 transition-opacity">
                เข้าสู่ระบบ
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
