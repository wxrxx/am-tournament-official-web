"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ShoppingBag,
  Image as ImageIcon,
  Newspaper,
  Shield,
  CalendarDays,
  Trophy,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  CreditCard,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
  Dices,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
}

// ─── Menu Config ────────────────────────────────────────────────────────────
const MENU_GROUPS: MenuGroup[] = [
  {
    id: "overview",
    label: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/admin", icon: BarChart3 },
    ],
  },
  {
    id: "tournament",
    label: "TOURNAMENT",
    items: [
      { name: "รายการแข่งขัน", href: "/admin/competitions", icon: Trophy },
      { name: "ใบสมัครทีม", href: "/admin/registrations", icon: ClipboardList },
      { name: "สโมสร", href: "/admin/clubs", icon: Shield },
      { name: "แบ่งสาย", href: "/admin/draw", icon: Dices },
      { name: "ตารางแข่ง", href: "/admin/schedule", icon: CalendarDays },
      { name: "ผลการแข่งขัน", href: "/admin/results", icon: Trophy },
      { name: "ตารางคะแนน", href: "/admin/standings", icon: BarChart3 },
      { name: "Bracket", href: "/admin/bracket", icon: Trophy },
      { name: "ทำเนียบแชมป์", href: "/admin/champions", icon: Trophy },
    ],
  },
  {
    id: "content",
    label: "CONTENT",
    items: [
      { name: "ข่าวสาร", href: "/admin/news", icon: Newspaper },
      { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
      { name: "Shop", href: "/admin/shop", icon: ShoppingBag },
      { name: "แพ็กเกจทีม", href: "/admin/packages", icon: Package },
    ],
  },
  {
    id: "system",
    label: "SYSTEM",
    items: [
      { name: "ผู้ใช้", href: "/admin/users", icon: Users },
      { name: "คำสั่งซื้อ", href: "/admin/orders", icon: CreditCard },
      { name: "ตั้งค่า", href: "/admin/settings", icon: Settings },
    ],
  },
];

// ─── Inline transition styles ───────────────────────────────────────────────
const SIDEBAR_TRANSITION = "width 300ms ease-in-out";
const FADE_IN_STYLE = (expanded: boolean): React.CSSProperties => ({
  opacity: expanded ? 1 : 0,
  transition: "opacity 200ms ease-in-out",
  transitionDelay: expanded ? "150ms" : "0ms",
  whiteSpace: "nowrap" as const,
  overflow: "hidden" as const,
});

const DRAWER_STYLE = (open: boolean): React.CSSProperties => ({
  transform: open ? "translateX(0)" : "translateX(-100%)",
  opacity: open ? 1 : 0,
  transition: "transform 300ms ease-in-out, opacity 200ms ease-in-out",
});
const BACKDROP_STYLE = (open: boolean): React.CSSProperties => ({
  opacity: open ? 1 : 0,
  pointerEvents: open ? "auto" as const : "none" as const,
  transition: "opacity 300ms ease-in-out",
});

// ─── Component ──────────────────────────────────────────────────────────────
export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  // Desktop hover expand
  const [expanded, setExpanded] = useState(true);
  // Mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  const isActive = (href: string) => {
    // For dashboard, exactly match "/admin"
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  // ── Sidebar content ──────────────────────────────────────────────────────
  const renderContent = (isExpanded: boolean, isMobile: boolean) => {
    const fadeStyle = isMobile ? undefined : FADE_IN_STYLE(isExpanded);

    return (
      <>
        {/* ── Brand ────────────────────────────────────────────────────── */}
        <div
          className={cn(
            "flex items-center h-16 shrink-0 border-b border-zinc-100 dark:border-zinc-800 overflow-hidden",
            isExpanded ? "px-5 gap-3" : "justify-center"
          )}
        >
          <span className="w-8 h-8 rounded-md bg-[#facc15] flex items-center justify-center text-black font-bold text-sm shrink-0 select-none">
            A
          </span>
          {isExpanded && (
            <span
              className="font-bold text-sm tracking-wide text-zinc-800 dark:text-zinc-100"
              style={fadeStyle}
            >
              AM Tournament
            </span>
          )}
        </div>

        {/* ── Toggle Button (Desktop only) ─────────────────────────────── */}
        {!isMobile && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={cn(
              "w-full h-9 flex items-center border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
              isExpanded ? "justify-end px-3" : "justify-center"
            )}
            style={{ transition: "color 200ms" }}
            aria-label={isExpanded ? "ย่อเมนู" : "ขยายเมนู"}
          >
            {isExpanded ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </button>
        )}

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 custom-scrollbar">
          {MENU_GROUPS.map((group, idx) => (
            <div key={group.id} className={cn("mb-2", idx === 0 ? "mt-0" : "mt-4")}>
              {/* Section Header */}
              {isExpanded ? (
                <div 
                  className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 px-5 py-2 mb-1"
                  style={fadeStyle}
                >
                  {group.label}
                </div>
              ) : (
                <div className="h-6 mx-2 border-b border-zinc-100 dark:border-zinc-800 mb-2 mt-4" />
              )}

              {/* Items */}
              <div className="px-2 space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 h-10 rounded-md text-[13px] border-l-2",
                        isExpanded ? "px-3" : "justify-center px-0",
                        active
                          ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 text-zinc-900 dark:text-yellow-400 font-semibold"
                          : "border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
                      )}
                      title={!isExpanded ? item.name : undefined}
                      style={{ transition: "background-color 200ms, color 200ms, border-color 200ms" }}
                    >
                      <Icon
                        size={16}
                        strokeWidth={active ? 2.2 : 1.5}
                        className="shrink-0"
                      />
                      {isExpanded && (
                        <span style={fadeStyle}>{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── Bottom ───────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-zinc-100 dark:border-zinc-800 p-2 space-y-0.5">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md text-[13px] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
              isExpanded ? "h-10 px-3 border-l-2 border-transparent" : "h-10 justify-center"
            )}
            style={{ transition: "background-color 200ms, color 200ms" }}
            title={!isExpanded ? "กลับหน้าหลัก" : undefined}
          >
            <ChevronLeft size={18} strokeWidth={1.6} className="shrink-0" />
            {isExpanded && (
              <span className="font-medium" style={fadeStyle}>
                กลับหน้าหลัก
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "group/logout flex items-center gap-3 rounded-md text-[13px] w-full",
              "text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500",
              isExpanded ? "h-10 px-3 border-l-2 border-transparent" : "h-10 justify-center"
            )}
            style={{ transition: "background-color 200ms, color 200ms" }}
            title={!isExpanded ? "ออกจากระบบ" : undefined}
          >
            <LogOut
              size={18}
              strokeWidth={1.6}
              className="shrink-0 group-hover/logout:-rotate-12"
              style={{ transition: "transform 200ms ease-in-out" }}
            />
            {isExpanded && (
              <span className="font-medium" style={fadeStyle}>
                ออกจากระบบ
              </span>
            )}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP — click‑to‑toggle
      ══════════════════════════════════════════════════════════════════ */}
      <aside className="hidden md:flex">
        {/* Sidebar panel */}
        <div
          className="fixed left-0 top-16 bottom-0 z-40 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800"
          style={{
            width: expanded ? "240px" : "64px",
            transition: SIDEBAR_TRANSITION,
          }}
        >
          {renderContent(expanded, false)}
        </div>

        {/* Spacer — pushes main content */}
        <div
          className="shrink-0"
          style={{
            width: expanded ? "240px" : "64px",
            transition: SIDEBAR_TRANSITION,
          }}
        />
      </aside>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE — hamburger + drawer
      ══════════════════════════════════════════════════════════════════ */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-[18px] left-4 z-50 w-9 h-9 flex items-center justify-center rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 shadow-sm"
        aria-label="เปิดเมนู"
      >
        <Menu size={18} />
      </button>

      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        style={BACKDROP_STYLE(mobileOpen)}
        onClick={() => setMobileOpen(false)}
      />

      {/* Drawer */}
      <div
        className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800"
        style={DRAWER_STYLE(mobileOpen)}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 z-10"
          style={{ transition: "background-color 200ms, color 200ms" }}
          aria-label="ปิดเมนู"
        >
          <X size={16} />
        </button>
        {renderContent(true, true)}
      </div>
    </>
  );
}
