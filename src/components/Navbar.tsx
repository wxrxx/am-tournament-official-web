"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Sun, Moon, Menu, UserCircle, LogOut, LayoutDashboard, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const navLinks = [
  { name: "หน้าแรก", href: "/" },
  { name: "สโมสร", href: "/teams" },
  { name: "ตารางแข่งขัน", href: "/schedule" },
  { name: "ผลการแข่งขัน", href: "/results" },
  { name: "สมัครทีม", href: "/register-team" },
  { name: "แกลเลอรี่", href: "/gallery" },
  { name: "สโตร์", href: "/shop" },
  { name: "แพ็กทีม", href: "/team-package" },
  { name: "ข่าวสาร", href: "/news" },
];

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isSignedIn, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    toast.success("ออกจากระบบสำเร็จ");
    router.push("/");
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 transition-opacity hover:opacity-80">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-[12px] font-bold text-black leading-none">
            AM
          </div>
          <span className="font-semibold text-sm tracking-widest uppercase text-foreground hidden sm:inline-block">
            AM Tournament
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-[13px] transition-colors tracking-wide font-medium ${
                pathname === l.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.name}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {isSignedIn ? (
            <div className="hidden lg:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "gap-2 px-2 hover:bg-muted/50"
                  )}
                >
                  <UserCircle size={20} className="text-primary" />
                  <span className="text-[13px] font-medium">{user?.fullName}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/admin" />}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    แผงควบคุมแอดมิน
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    ข้อมูลส่วนตัว
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger
                      className="relative flex w-full cursor-default select-none items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none transition-colors hover:bg-destructive/10 text-red-500"
                    >
                      <LogOut className="h-4 w-4" />
                      ออกจากระบบ
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการออกจากระบบ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบบัญชี AM Tournament ในขณะนี้
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSignOut} variant="destructive">
                          ออกจากระบบ
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-[12px] font-bold tracking-widest uppercase"
                )}
              >
                LOGIN
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "text-[12px] font-bold tracking-widest uppercase rounded-sm"
                )}
              >
                JOIN
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "lg:hidden text-muted-foreground"
              )}
            >
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] flex flex-col p-0">
              <SheetHeader className="p-6 text-left border-b border-border/40">
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-[12px] font-bold text-black leading-none">
                    AM
                  </div>
                  <span className="font-semibold text-sm tracking-widest uppercase">AM Tournament</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`py-4 border-b border-border/30 text-lg font-medium transition-colors ${
                      pathname === l.href ? "text-primary" : "text-foreground hover:text-primary"
                    }`}
                  >
                    {l.name}
                  </Link>
                ))}
              </nav>
              <div className="p-6 border-t border-border/40 space-y-4">
                {isSignedIn ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-sm">
                      <UserCircle size={24} className="text-primary" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{user?.fullName}</span>
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {user?.primaryEmailAddress?.emailAddress}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full justify-start gap-2"
                      )}
                    >
                      <LayoutDashboard size={18} /> แผงควบคุมแอดมิน
                    </Link>
                    <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleSignOut}>
                      <LogOut size={18} /> ออกจากระบบ
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "rounded-sm font-bold uppercase tracking-widest text-[11px]"
                      )}
                    >
                      LOG IN
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        buttonVariants(),
                        "rounded-sm font-bold uppercase tracking-widest text-[11px]"
                      )}
                    >
                      JOIN US
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
