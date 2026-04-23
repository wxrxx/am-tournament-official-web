"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import ClientFooter from "@/components/ClientFooter";

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const isOverlayPage = pathname?.startsWith("/overlay");
  const hideNavbar = isAdminPage || isOverlayPage;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      {!hideNavbar && <ClientFooter />}
    </>
  );
}
