"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChampionRecord {
  id: string;
  competitionId: string;
  competitionName: string;
  season: string;
  year: number;
  champion: string;
  runnerUp: string;
  thirdPlace: string;
}

export default function ChampionsPage() {
  const [champions, setChampions] = useState<ChampionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComp, setSelectedComp] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "champions"), orderBy("year", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: ChampionRecord[] = snap.docs.map((d) => ({
        id: d.id,
        competitionId: (d.data().competitionId as string) ?? "",
        competitionName: (d.data().competitionName as string) ?? "",
        season: (d.data().season as string) ?? "",
        year: (d.data().year as number) ?? 0,
        champion: (d.data().champion as string) ?? "",
        runnerUp: (d.data().runnerUp as string) ?? "",
        thirdPlace: (d.data().thirdPlace as string) ?? "",
      }));
      setChampions(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Derive unique competition names for filter tabs
  const competitionNames = [...new Set(champions.map((c) => c.competitionName))].sort();

  const filtered = selectedComp === "all"
    ? champions
    : champions.filter((c) => c.competitionName === selectedComp);

  return (
    <div className="pt-16 min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          Hall of Fame
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-4">ทำเนียบแชมป์</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          บันทึกประวัติแชมป์ รองแชมป์ และอันดับ 3 ของทุกรายการแข่งขัน
        </p>
      </div>

      <div className="border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : champions.length === 0 ? (
            <div className="py-24 text-center">
              <Trophy size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm">ยังไม่มีข้อมูลทำเนียบแชมป์</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Filter Tabs */}
              {competitionNames.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComp("all")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200",
                      selectedComp === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    ทั้งหมด
                  </button>
                  {competitionNames.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setSelectedComp(name)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200",
                        selectedComp === name
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}

              {/* Champion Cards */}
              <div className="grid gap-4">
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors"
                  >
                    {/* Card Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 bg-muted/20">
                      <Trophy size={18} className="text-yellow-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-sm truncate">{c.competitionName}</h3>
                        <p className="text-[11px] text-muted-foreground">
                          {c.season ? `${c.season} ∙ ` : ""}{c.year}
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-primary tabular-nums">{c.year}</span>
                    </div>

                    {/* Card Body */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
                      {/* Champion */}
                      <div className="px-6 py-5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/15 flex items-center justify-center shrink-0">
                          <span className="text-sm">🏆</span>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-yellow-400 font-bold mb-0.5">แชมป์</p>
                          <p className="font-bold text-foreground text-sm">{c.champion || "-"}</p>
                        </div>
                      </div>

                      {/* Runner Up */}
                      <div className="px-6 py-5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-500/15 flex items-center justify-center shrink-0">
                          <Medal size={14} className="text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">รองแชมป์</p>
                          <p className="font-medium text-foreground text-sm">{c.runnerUp || "-"}</p>
                        </div>
                      </div>

                      {/* Third Place */}
                      <div className="px-6 py-5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                          <span className="text-sm">🥉</span>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">อันดับ 3</p>
                          <p className="font-medium text-foreground text-sm">{c.thirdPlace || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pb-32" />
    </div>
  );
}
