"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { DataService, Package } from "@/services/dataService";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamPackagePage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getPackages().then((res) => {
      // Filter out inactive packages
      setPackages((res || []).filter(p => p.status === "Active"));
      setLoading(false);
    });
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-background pb-32 animate-in fade-in duration-700">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center space-y-6">
        <Badge variant="outline" className="px-4 py-1 border-primary/40 text-primary font-bold tracking-[0.3em] uppercase text-[10px]">
          Photography Packages
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">แพ็คจองช่างภาพ</h1>
        <p className="text-muted-foreground max-w-md mx-auto text-base leading-relaxed">
          จ้างช่างภาพกีฬามืออาชีพบันทึกทุกช่วงเวลาสำคัญของทีมคุณตลอดทั้งฤดูกาล
        </p>
      </section>

      {/* Packages */}
      <div className="max-w-5xl mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col border border-border/40 bg-card p-6 gap-6">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-1/2" />
                <Separator className="bg-border/30" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-11 w-full mt-auto" />
              </Card>
            ))}
          </div>
        ) : packages.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 gap-8">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl scale-150" />
              <div className="relative w-24 h-24 rounded-full border border-border/20 bg-card flex items-center justify-center shadow-inner">
                <svg
                  className="w-10 h-10 text-muted-foreground/40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
            </div>

            <div className="text-center space-y-2 max-w-sm">
              <p className="text-base font-semibold text-foreground tracking-tight">
                ยังไม่มีแพ็คเกจช่างภาพเปิดรับในตอนนี้
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                เตรียมพบกับแพ็คเกจสำหรับบันทึกภาพตลอดฤดูกาล เร็วๆ นี้
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full max-w-xs">
              <div className="flex-1 h-px bg-border/30" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold">Coming Soon</span>
              <div className="flex-1 h-px bg-border/30" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`flex flex-col border transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 ${
                  pkg.popular
                    ? "border-primary/50 bg-card shadow-primary/10"
                    : "border-border/40 bg-card"
                }`}
              >
                <CardHeader className="space-y-4">
                  {pkg.popular && (
                    <Badge className="w-fit bg-primary text-black font-bold text-[10px] tracking-widest uppercase px-3 py-1">
                      ยอดนิยม
                    </Badge>
                  )}
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tight">{pkg.name}</CardTitle>
                    <CardDescription className="mt-2 text-sm leading-relaxed">
                      {pkg.description || "แพ็คเกจถ่ายภาพสำหรับทีมของคุณ"}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-6">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-foreground">{pkg.price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground font-medium">{pkg.unit || "บาท"}</span>
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  <ul className="space-y-3">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <Link
                    href={`/shop/checkout?type=package&id=${pkg.id}&price=${pkg.price}&name=${encodeURIComponent(pkg.name)}`}
                    className={cn(
                      buttonVariants({ variant: pkg.popular ? "default" : "outline" }),
                      `w-full font-bold uppercase tracking-widest text-[11px] h-11 rounded-sm ${
                        pkg.popular
                          ? ""
                          : "hover:bg-foreground hover:text-background transition-all"
                      }`
                    )}
                  >
                    Book This Package
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-20 text-center space-y-4 opacity-50">
          <Separator className="bg-border/20" />
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">
            Professional Sports Photography // Limited Slots Per Season // Secure Booking
          </p>
        </div>
      </div>
    </div>
  );
}
