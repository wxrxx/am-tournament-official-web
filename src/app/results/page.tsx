"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DataService, Match } from "@/services/dataService";

export default function ResultsPage() {
  const [results, setResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getMatches().then((res) => {
      // Filter only completed matches for results
      const completed = res.filter(m => m.status === "completed");
      setResults(completed);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="pt-32 flex justify-center text-muted-foreground text-sm animate-pulse">
      กำลังดึงข้อมูลผลการแข่งขัน...
    </div>
  );

  return (
    <div className="pt-16 min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          Match Results
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-4">ผลการแข่งขัน & ตารางคะแนน</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          สรุปผลการแข่งขันล่าสุดและตารางคะแนนสะสมของศึกลูกหนัง
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Results Column */}
        <div className="lg:col-span-12 flex flex-col gap-8">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest border-b border-border/40 pb-4">
            ผลแข่งขันล่าสุด
          </h2>
          
          {results.length === 0 ? (
            <div className="py-20 border border-dashed border-border/60 rounded-sm text-center">
              <p className="text-sm text-muted-foreground">ยังไม่มีผลการแข่งขันในขณะนี้</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {results.map((res, i) => (
                <div key={i} className="bg-card p-5 border border-border/40 rounded-sm">
                  <p className="text-[10px] text-muted-foreground mb-4">{res.date}</p>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{res.home || res.teamA}</p>
                    </div>
                    <div className="flex items-center gap-4 font-bold text-lg text-foreground bg-background px-4 py-2 rounded-sm border border-border/40">
                      <span>{res.score?.split("-")[0] || "0"}</span>
                      <span className="text-muted-foreground text-[10px] font-normal uppercase">FT</span>
                      <span>{res.score?.split("-")[1] || "0"}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{res.away || res.teamB}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
