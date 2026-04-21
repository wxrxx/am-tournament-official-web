"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { 
  BarChart3, 
  Image as ImageIcon, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  LogOut,
  ChevronLeft,
  Circle,
  Trophy,
  Users
} from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { name: "แดชบอร์ด", href: "/admin", icon: BarChart3 },
  { name: "จัดการแกลเลอรี่", href: "/admin/gallery", icon: ImageIcon },
  { name: "จัดการร้านค้า", href: "/admin/shop", icon: ShoppingBag },
  { name: "จัดการแพ็คทีม", href: "/admin/packages", icon: Package },
  { name: "จัดการรายการแข่งขัน", href: "/admin/competitions", icon: Trophy },
  { name: "จัดการใบสมัคร", href: "/admin/team-registrations", icon: Users },
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
    <aside className="w-64 h-[calc(100vh-64px)] bg-card border-r border-border/40 fixed left-0 top-16 z-40 flex flex-col transition-all">
      {/* Branding & Status */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 bg-primary flex items-center justify-center font-bold text-black text-[10px] rounded-sm">
            AM
          </div>
          <span className="font-semibold text-[11px] tracking-widest uppercase text-foreground">
            ADMIN PANEL
          </span>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 py-1 px-3">
              <Circle size={8} className="fill-emerald-500 animate-pulse" />
              LIVE MODE
            </Badge>
            <p className="text-[10px] text-muted-foreground font-medium leading-tight opacity-70">
              Connected to Cloudinary + Firestore
            </p>
          </div>
        </div>
      </div>

      <Separator className="mx-6 w-auto bg-border/40" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 h-11 px-4 rounded-sm transition-all text-sm",
                  isActive
                    ? "bg-primary text-black font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium"
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border/40 space-y-1">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "w-full justify-start gap-3 text-muted-foreground hover:text-foreground h-11 px-4"
          )}
        >
          <ChevronLeft size={18} />
          กลับหน้าหลัก
        </Link>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-red-500 hover:bg-red-500/10 hover:text-red-500 h-11 px-4"
        >
          <LogOut size={18} />
          ออกจากระบบ
        </Button>
      </div>
    </aside>
  );
}
