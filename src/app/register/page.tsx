"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

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

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (password.length < 6) {
      toast.error("รหัสผ่านสั้นเกินไป", {
        description: "กรุณาใช้รหัสผ่านอย่างน้อย 6 ตัวอักษร เพื่อความปลอดภัยของคุณ",
      });
      return;
    }

    setLoading(true);
    const ok = await signUp(email, password, fullName);
    setLoading(false);

    if (ok) {
      toast.success("สมัครสมาชิกสำเร็จ", {
        description: "ยินดีต้อนรับเข้าสู่อละครอบครัว AM Tournament!",
      });
      router.push("/");
    } else {
      toast.error("สมัครสมาชิกไม่สำเร็จ", {
        description: "อีเมลนี้อาจถูกใช้งานไปแล้ว หรือมีข้อผิดพลาดบางประการ",
      });
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="border-border/40 shadow-xl overflow-hidden rounded-sm">
          <CardHeader className="space-y-4 text-center pt-10">
            <div className="mx-auto w-12 h-12 bg-primary rounded-sm flex items-center justify-center shadow-lg transform transition-transform hover:-rotate-3">
              <span className="text-black font-bold text-lg">AM</span>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight">สมัครสมาชิกใหม่</CardTitle>
              <CardDescription className="text-sm px-4">
                ร่วมเป็นสมาชิกครอบครัวฟุตบอลที่ยิ่งใหญ่ที่สุดในสตูล
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                  <Input
                    id="fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ชื่อ-นามสกุล ของคุณ"
                    className="pl-11 h-12 bg-muted/20 border-border/40 focus-visible:ring-primary rounded-sm"
                    required
                  />
                </div>
              </div>

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
                <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ขั้นต่ำ 6 ตัวอักษร"
                    className="pl-11 h-12 bg-muted/20 border-border/40 focus-visible:ring-primary rounded-sm"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 font-bold uppercase tracking-widest text-xs rounded-sm group bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      JOIN THE FAMILY
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t border-border/40 bg-muted/30 py-6 text-center">
            <p className="text-xs text-muted-foreground">
              มีบัญชีสมาชิกอยู่แล้วใช่หรือไม่?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                LOG IN HERE
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
