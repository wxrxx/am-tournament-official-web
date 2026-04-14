"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { swal } from "@/lib/swal";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

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
      swal.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (password.length < 6) {
      swal.error("รหัสผ่านสั้นเกินไป", "กรุณาใช้รหัสผ่านอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);
    const ok = await signUp(email, password, fullName);
    setLoading(false);

    if (ok) {
      swal.success("สมัครสมาชิกสำเร็จ", "ยินดีต้อนรับเข้าสู้ครอบครัว AM Tournament");
      router.push("/");
    } else {
      swal.error("สมัครสมาชิกไม่สำเร็จ", "อีเมลนี้อาจถูกใช้งานไปแล้ว หรือข้อมูลไม่ถูกต้อง");
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-sm mb-6">
            <span className="text-black font-bold text-lg">AM</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-3">สมัครสมาชิก</h1>
          <p className="text-sm text-muted-foreground">
            ร่วมเป็นส่วนหนึ่งของครอบครัว AM Tournament วันนี้
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ชื่อ-นามสกุล ของคุณ"
                className="w-full bg-card border border-border/60 rounded-sm py-3.5 pl-12 pr-4 text-sm focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-card border border-border/60 rounded-sm py-3.5 pl-12 pr-4 text-sm focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="w-full bg-card border border-border/60 rounded-sm py-3.5 pl-12 pr-4 text-sm focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background py-4 rounded-sm font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  SIGN UP NOW
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
