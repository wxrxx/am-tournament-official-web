import type { Metadata } from "next";
import { Kanit, Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import ClientFooter from "@/components/ClientFooter";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const kanit = Kanit({
  variable: "--font-kanit",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
});

export const metadata: Metadata = {
  title: "AM Tournament Official Website",
  description: "เว็บไซต์อย่างเป็นทางการของ AM Tournament ทัวร์นาเมนต์ฟุตบอลสมัครเล่นจังหวัดสตูล",
};

// Inline script that runs BEFORE hydration to set dark/light class on <html>
const themeScript = `(function(){
  try {
    var t = localStorage.getItem('am_theme');
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        {/* Must run before React hydration to avoid theme flash */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <ClientFooter />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
