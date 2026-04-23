"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type AuthStatus = "loading" | "authorized" | "unauthorized";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn, user } = useAuth();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    if (!isLoaded) return;

    // Step 1: Check if user is signed in
    if (!isSignedIn || !user) {
      router.replace("/login");
      return;
    }

    // Step 2: Verify role from Firestore (defense in depth)
    const verifyAdmin = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.id));
        
        if (!userDoc.exists()) {
          toast.error("ไม่พบข้อมูลผู้ใช้ในระบบ");
          router.replace("/");
          return;
        }

        const data = userDoc.data();

        // Check banned status
        if (data.banned === true) {
          toast.error("บัญชีของคุณถูกระงับการใช้งาน");
          router.replace("/login");
          return;
        }

        // Check admin role
        if (data.role !== "admin") {
          toast.error("ไม่มีสิทธิ์เข้าถึงหน้า Admin");
          router.replace("/");
          return;
        }

        // All checks passed
        setAuthStatus("authorized");
      } catch (error) {
        console.error("Admin verification error:", error);
        toast.error("เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์");
        router.replace("/");
      }
    };

    verifyAdmin();
  }, [isLoaded, isSignedIn, user, router]);

  // Loading state - don't show any admin UI
  if (authStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">
          กำลังตรวจสอบสิทธิ์...
        </p>
      </div>
    );
  }

  // Only render admin UI when fully authorized
  if (authStatus !== "authorized") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 md:p-10 lg:p-14">
        {children}
      </main>
    </div>
  );
}
