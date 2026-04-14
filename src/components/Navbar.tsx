"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { swal } from "@/lib/swal";
import { Sun, Moon, X, Menu, UserCircle } from "lucide-react";

const navLinks = [
  { name: "หน้าแรก", href: "/" },
  { name: "สโมสร", href: "/teams" },
  { name: "ตารางแข่งขัน", href: "/schedule" },
  { name: "ผลการแข่งขัน", href: "/results" },
  { name: "แกลเลอรี่", href: "/gallery" },
  { name: "สโตร์", href: "/shop" },
  { name: "แพ็กทีม", href: "/team-package" },
  { name: "ข่าวสาร", href: "/news" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    swal.confirm("คุณต้องการออกจากระบบใช่หรือไม่?").then((res) => {
      if (res.isConfirmed) {
        signOut();
        swal.success("ออกจากระบบสำเร็จ");
      }
    });
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-background/90 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setIsOpen(false)}>
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
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
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
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border/40">
                   <UserCircle size={16} className="text-primary" />
                   <span className="text-[12px] font-medium text-foreground">{user?.fullName}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-[12px] text-muted-foreground hover:text-foreground transition-colors uppercase font-bold tracking-widest"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-[12px] px-4 py-2 text-muted-foreground hover:text-foreground transition-colors font-bold uppercase tracking-widest"
                >
                  LOGIN
                </Link>
                <Link
                  href="/register"
                  className="text-[12px] px-4 py-2 bg-foreground text-background font-bold rounded-sm hover:opacity-90 transition-opacity uppercase tracking-widest"
                >
                  JOIN
                </Link>
              </div>
            )}

            <button
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1"
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
          <nav className="flex flex-col p-6 gap-1 overflow-y-auto">
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
          <div className="p-6 mt-auto space-y-3">
            {isSignedIn ? (
              <button onClick={() => { handleSignOut(); setIsOpen(false); }}
                className="w-full py-4 border border-border rounded-sm text-foreground font-bold text-sm hover:bg-muted transition-colors uppercase tracking-widest">
                SIGN OUT ({user?.fullName})
              </button>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full py-4 border border-border rounded-sm text-foreground font-bold text-sm hover:bg-muted transition-colors uppercase tracking-widest">
                  LOGIN
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full py-4 bg-foreground text-background rounded-sm font-bold text-sm hover:opacity-90 transition-opacity uppercase tracking-widest">
                  JOIN THE FAMILY
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
