"use client";

import { useState, useEffect } from "react";
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
  ChevronDown,
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
  icon: React.ElementType;
  items: MenuItem[];
}

// ─── Menu Config ────────────────────────────────────────────────────────────
const STANDALONE: MenuItem = {
  name: "แดชบอร์ด",
  href: "/admin",
  icon: BarChart3,
};

const MENU_GROUPS: MenuGroup[] = [
  {
    id: "tournament",
    label: "จัดการรายการแข่ง",
    icon: Trophy,
    items: [
      { name: "รายการแข่งขัน", href: "/admin/competitions", icon: Trophy },
      { name: "แบ่งสาย", href: "/admin/draw", icon: Dices },
      { name: "ตารางแข่ง", href: "/admin/schedule", icon: CalendarDays },
      { name: "ผลการแข่งขัน", href: "/admin/results", icon: Trophy },
    ],
  },
  {
    id: "teams",
    label: "จัดการทีม",
    icon: Shield,
    items: [
      { name: "ใบสมัครทีม", href: "/admin/registrations", icon: ClipboardList },
      { name: "สโมสร", href: "/admin/clubs", icon: Shield },
      { name: "แพ็คทีม", href: "/admin/packages", icon: Package },
    ],
  },
  {
    id: "content",
    label: "จัดการคอนเทนต์",
    icon: Newspaper,
    items: [
      { name: "สินค้า", href: "/admin/shop", icon: ShoppingBag },
      { name: "แกลเลอรี่", href: "/admin/gallery", icon: ImageIcon },
      { name: "ข่าวสาร", href: "/admin/news", icon: Newspaper },
    ],
  },
  {
    id: "system",
    label: "ระบบ",
    icon: Settings,
    items: [
      { name: "คำสั่งซื้อ", href: "/admin/orders", icon: CreditCard },
      { name: "ผู้ใช้", href: "/admin/users", icon: Users },
      { name: "ตั้งค่า", href: "/admin/settings", icon: Settings },
    ],
  },
];

// ─── Helper ─────────────────────────────────────────────────────────────────
function findActiveGroup(pathname: string): string | null {
  for (const g of MENU_GROUPS) {
    if (g.items.some((i) => pathname === i.href)) return g.id;
  }
  return null;
}

// ─── Inline transition styles ───────────────────────────────────────────────
const SIDEBAR_TRANSITION = "width 300ms ease-in-out";
const FADE_IN_STYLE = (expanded: boolean): React.CSSProperties => ({
  opacity: expanded ? 1 : 0,
  transition: "opacity 200ms ease-in-out",
  transitionDelay: expanded ? "150ms" : "0ms",
  whiteSpace: "nowrap" as const,
  overflow: "hidden" as const,
});
const ACCORDION_STYLE = (open: boolean): React.CSSProperties => ({
  maxHeight: open ? "400px" : "0px",
  opacity: open ? 1 : 0,
  overflow: "hidden",
  transition: "max-height 300ms ease-in-out, opacity 200ms ease-in-out",
});
const CHEVRON_STYLE = (open: boolean): React.CSSProperties => ({
  transform: open ? "rotate(180deg)" : "rotate(0deg)",
  transition: "transform 300ms ease-in-out",
});
const ACTIVE_BAR_STYLE = (active: boolean): React.CSSProperties => ({
  transform: active ? "scaleY(1)" : "scaleY(0)",
  transformOrigin: "top",
  transition: "transform 200ms ease-in-out",
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
  const [expanded, setExpanded] = useState(false);
  // Accordion — single-open
  const [openGroup, setOpenGroup] = useState<string | null>(
    findActiveGroup(pathname)
  );
  // Mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-open accordion group for active route
  useEffect(() => {
    const active = findActiveGroup(pathname);
    if (active) setOpenGroup(active);
  }, [pathname]);

  const toggleGroup = (id: string) =>
    setOpenGroup((prev) => (prev === id ? null : id));

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  const isActive = (href: string) => pathname === href;

  // ── Active indicator bar ──────────────────────────────────────────────────
  const ActiveBar = ({ active }: { active: boolean }) => (
    <span
      className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-yellow-400"
      style={ACTIVE_BAR_STYLE(active)}
    />
  );

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
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
          {/* Dashboard — standalone */}
          <div className="px-2 mb-1">
            <Link
              href={STANDALONE.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "relative flex items-center gap-3 rounded-md",
                isExpanded ? "h-10 px-3 text-[13px]" : "h-10 justify-center",
                isActive(STANDALONE.href)
                  ? "bg-yellow-50 dark:bg-yellow-500/10 text-zinc-900 dark:text-yellow-400"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
              style={{ transition: "background-color 200ms, color 200ms" }}
            >
              <ActiveBar active={isActive(STANDALONE.href)} />
              <STANDALONE.icon
                size={18}
                strokeWidth={isActive(STANDALONE.href) ? 2.2 : 1.6}
                className="shrink-0"
              />
              {isExpanded && (
                <span className="font-medium" style={fadeStyle}>
                  {STANDALONE.name}
                </span>
              )}
            </Link>
          </div>

          {/* Grouped menus */}
          {MENU_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const isOpen = openGroup === group.id;
            const groupHasActive = group.items.some((i) => isActive(i.href));

            return (
              <div key={group.id} className="mt-2">
                {/* Group header */}
                {isExpanded ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="flex items-center w-full h-9 px-5 gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                    style={{ transition: "color 200ms" }}
                  >
                    <span className="flex-1 text-left" style={fadeStyle}>
                      {group.label}
                    </span>
                    <ChevronDown
                      size={12}
                      className="shrink-0"
                      style={{
                        ...CHEVRON_STYLE(isOpen),
                        ...(isMobile ? {} : { opacity: isExpanded ? 1 : 0 }),
                      }}
                    />
                  </button>
                ) : (
                  <div
                    className="flex items-center h-10 justify-center mx-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-default"
                    style={{ transition: "background-color 200ms" }}
                  >
                    <GroupIcon
                      size={18}
                      strokeWidth={1.6}
                      className="shrink-0"
                      style={{
                        color: groupHasActive ? "#facc15" : undefined,
                        transition: "color 200ms",
                      }}
                    />
                  </div>
                )}

                {/* Accordion items */}
                {isExpanded && (
                  <div style={ACCORDION_STYLE(isOpen)}>
                    <div className="px-2 pb-1 pt-0.5 space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "relative flex items-center gap-3 h-10 px-3 rounded-md text-[13px]",
                              active
                                ? "bg-yellow-50 dark:bg-yellow-500/10 text-zinc-900 dark:text-yellow-400 font-semibold"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
                            )}
                            style={{ transition: "background-color 200ms, color 200ms" }}
                          >
                            <ActiveBar active={active} />
                            <Icon
                              size={16}
                              strokeWidth={active ? 2.2 : 1.5}
                              className="shrink-0"
                            />
                            <span style={fadeStyle}>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── Bottom ───────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-zinc-100 dark:border-zinc-800 p-2 space-y-0.5">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md text-[13px] text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
              isExpanded ? "h-10 px-3" : "h-10 justify-center"
            )}
            style={{ transition: "background-color 200ms, color 200ms" }}
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
              isExpanded ? "h-10 px-3" : "h-10 justify-center"
            )}
            style={{ transition: "background-color 200ms, color 200ms" }}
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
