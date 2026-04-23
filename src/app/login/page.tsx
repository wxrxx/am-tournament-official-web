"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setLoading(true);
    const ok = await signIn(email, password);
    setLoading(false);

    if (ok) {
      toast.success("เข้าสู่ระบบสำเร็จ", {
        description: "ยินดีต้อนรับกลับเข้าสู่ครอบครัว AM Tournament",
      });
      router.push(redirectUrl);
    } else {
      toast.error("เข้าสู่ระบบล้มเหลว", {
        description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  return (
    <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-border/40 shadow-xl overflow-hidden rounded-sm">
        <CardHeader className="space-y-4 text-center pt-10">
          <div className="mx-auto w-12 h-12 bg-primary rounded-sm flex items-center justify-center shadow-lg transform transition-transform hover:rotate-3">
            <span className="text-black font-bold text-lg">AM</span>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">เข้าสู่ระบบ</CardTitle>
            <CardDescription className="text-sm">
              ล็อกอินเพื่อเข้าสู่ระบบสมาชิกและจัดการข้อมูลของคุณ
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-11 h-12 bg-muted/20 border-border/40 focus-visible:ring-primary rounded-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Password
                </Label>
                <Link href="#" className="text-[10px] text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 h-12 bg-muted/20 border-border/40 focus-visible:ring-primary rounded-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 font-bold uppercase tracking-widest text-xs rounded-sm group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  LOGIN NOW
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col border-t border-border/40 bg-muted/30 py-6">
          <p className="text-xs text-muted-foreground">
            ยังไม่มีบัญชีสมาชิก?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              JOIN THE FAMILY
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-background px-6">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
