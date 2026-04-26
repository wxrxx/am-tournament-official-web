import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import NavigationWrapper from "@/components/NavigationWrapper";
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
      <head />
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased font-sans" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
        <ThemeProvider>
          <AuthProvider>
            <NavigationWrapper>
              {children}
            </NavigationWrapper>
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
