"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart3, 
  Image as ImageIcon, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  LogOut,
  ChevronLeft
} from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";

const adminLinks = [
  { name: "แดชบอร์ด", href: "/admin", icon: BarChart3 },
  { name: "จัดการแกลเลอรี่", href: "/admin/gallery", icon: ImageIcon },
  { name: "จัดการร้านค้า", href: "/admin/shop", icon: ShoppingBag },
  { name: "จัดการแพ็คทีม", href: "/admin/packages", icon: Package },
  { name: "รายการสั่งซื้อ", href: "/admin/orders", icon: CreditCard },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  return (
    <aside className="w-64 h-[calc(100vh-64px)] bg-card border-r border-border/40 fixed left-0 top-16 z-40 flex flex-col">
      {/* Branding */}
      <div className="p-6 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-primary flex items-center justify-center font-bold text-black text-[10px] rounded-sm transition-transform group-hover:scale-105">
            AM
          </div>
          <span className="font-semibold text-xs tracking-widest uppercase text-foreground">
            ADMIN PANEL
          </span>
        </Link>
        <div className="mt-4 flex flex-col gap-2">
          {isFirebaseConfigured ? (
            <>
              <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20 w-fit">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                LIVE MODE
              </div>
              <p className="text-[9px] text-muted-foreground font-medium flex items-center gap-1 opacity-70">
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                Connected to Cloudinary + Firestore
              </p>
            </>
          ) : (
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold rounded-full border border-yellow-500/20 w-fit">
              MOCK MODE
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto mt-4">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all ${
                isActive 
                  ? "bg-primary text-black" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border/40 flex flex-col gap-1">
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <ChevronLeft size={18} />
          กลับหน้าหลัก
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
