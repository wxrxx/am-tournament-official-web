import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import ClientFooter from "@/components/ClientFooter";
import { Toaster } from "@/components/ui/sonner";

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
    } else if (t === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={kanit.variable} suppressHydrationWarning>
       {/* Use head for beforeInteractive scripts in Next 13+ to avoid body hydration issues */}
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased font-sans" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <ClientFooter />
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
