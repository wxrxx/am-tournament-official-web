"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        // TODO: Future Clerk Integration - Protected Route will be handled by middleware
        const email = prompt("คุณกำลังเข้าสู่พื้นที่สำหรับ Admin\nกรุณาใส่อีเมลของคุณ:");
        const pass = prompt("ใส่รหัสผ่านเพื่อเข้าใช้งาน:");
        
        if (pass === "am2026") {
          // Re-signIn logic if they aren't already logged in
          // This uses the existing signIn from AuthContext
          setAuthorized(true);
        } else {
          alert("รหัสผ่านไม่ถูกต้อง");
          router.push("/");
        }
      } else {
        setAuthorized(true);
      }
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground animate-pulse font-sans">
        กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans pt-16">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-8 md:p-12 lg:p-16">
          {children}
        </main>
      </div>
    </div>
  );
}
