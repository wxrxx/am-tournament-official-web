"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection, query, where, orderBy, onSnapshot, getDocs,
} from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────
interface CompItem { id: string; name: string; }
interface GroupItem { id: string; name: string; teamIds: string[]; }
interface ClubMap { [id: string]: { name: string; logo: string }; }

interface StandingRow {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

// ─── Main Content ──────────────────────────────────────────────
function StandingsContent() {
  const searchParams = useSearchParams();
  const compParam = searchParams.get("competition");

  const [competitions, setCompetitions] = useState<CompItem[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [clubs, setClubs] = useState<ClubMap>({});
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Load competitions
  useEffect(() => {
    const q = query(collection(db, "competitions"), orderBy("createdAt", "desc"));
    getDocs(q).then((snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, name: d.data().name as string }));
      setCompetitions(list);
      if (compParam && list.some((c) => c.id === compParam)) {
        setSelectedComp(compParam);
      } else if (list.length > 0) {
        setSelectedComp(list[0].id);
      }
      setLoading(false);
    });
  }, [compParam]);

  // Load groups
  useEffect(() => {
    if (!selectedComp) { setGroups([]); return; }
    const q = query(collection(db, "groups"), where("competitionId", "==", selectedComp));
    getDocs(q).then((snap) => {
      const g = snap.docs
        .map((d) => ({ id: d.id, name: d.data().name as string, teamIds: (d.data().teamIds as string[]) ?? [] }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setGroups(g);
      if (g.length > 0) setSelectedGroup(g[0].id);
    });
  }, [selectedComp]);

  // Load clubs
  useEffect(() => {
    if (groups.length === 0) { setClubs({}); return; }
    const allIds = [...new Set(groups.flatMap((g) => g.teamIds))];
    if (allIds.length === 0) return;

    const chunks: string[][] = [];
    for (let i = 0; i < allIds.length; i += 30) {
      chunks.push(allIds.slice(i, i + 30));
    }

    Promise.all(
      chunks.map((chunk) =>
        getDocs(query(collection(db, "clubs"), where("__name__", "in", chunk)))
      )
    ).then((results) => {
      const map: ClubMap = {};
      results.forEach((snap) => {
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.status === "active") {
            map[d.id] = { name: (data.name as string) ?? "", logo: (data.logo as string) ?? "" };
          }
        });
      });
      setClubs(map);
    });
  }, [groups]);

  // Real-time standings
  useEffect(() => {
    if (!selectedComp || !selectedGroup) { setStandings([]); return; }

    const q = query(
      collection(db, "standings"),
      where("competitionId", "==", selectedComp),
      where("groupId", "==", selectedGroup)
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows: StandingRow[] = snap.docs.map((d) => ({
        clubId: d.data().clubId as string,
        played: (d.data().played as number) ?? 0,
        won: (d.data().won as number) ?? 0,
        drawn: (d.data().drawn as number) ?? 0,
        lost: (d.data().lost as number) ?? 0,
        goalsFor: (d.data().goalsFor as number) ?? 0,
        goalsAgainst: (d.data().goalsAgainst as number) ?? 0,
        goalDiff: (d.data().goalDiff as number) ?? 0,
        points: (d.data().points as number) ?? 0,
      }));

      rows.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        return b.goalsFor - a.goalsFor;
      });

      setStandings(rows);
    });

    return () => unsub();
  }, [selectedComp, selectedGroup]);

  const activeGroupName = groups.find((g) => g.id === selectedGroup)?.name ?? "";

  return (
    <div className="pt-16 min-h-screen bg-background">
      {/* ── Header ── */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          League Table
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-4">ตารางคะแนน</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          อันดับคะแนนสะสมของทุกทีมในแต่ละสาย แบบเรียลไทม์
        </p>
      </div>

      <div className="border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="animate-spin text-primary mb-4" size={32} />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">กำลังโหลด...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* ── Competition Selector ── */}
              {competitions.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {competitions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setSelectedComp(c.id); setSelectedGroup(""); }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold border",
                        "transition-all duration-200",
                        selectedComp === c.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Group Tabs ── */}
              {groups.length > 0 && (
                <div className="flex gap-1 bg-muted/40 p-1 rounded-lg w-fit">
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGroup(g.id)}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-semibold",
                        "transition-all duration-200",
                        selectedGroup === g.id
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      สาย {g.name}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Standings Table ── */}
              {selectedGroup && (
                <div className="rounded-xl border border-border overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-muted/30 px-6 py-3 border-b border-border flex items-center gap-2">
                    <Trophy size={14} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      ตารางคะแนน สาย {activeGroupName}
                    </span>
                  </div>

                  {/* Desktop Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-[11px] uppercase tracking-wider">
                          <th className="text-center py-3 px-3 w-12">#</th>
                          <th className="text-left py-3 px-3">ทีม</th>
                          <th className="text-center py-3 px-2 w-10">เล่น</th>
                          <th className="text-center py-3 px-2 w-10">ชนะ</th>
                          <th className="text-center py-3 px-2 w-10">เสมอ</th>
                          <th className="text-center py-3 px-2 w-10">แพ้</th>
                          <th className="text-center py-3 px-2 w-10">ได้</th>
                          <th className="text-center py-3 px-2 w-10">เสีย</th>
                          <th className="text-center py-3 px-2 w-12">ต่าง</th>
                          <th className="text-center py-3 px-3 w-14 font-bold">คะแนน</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="text-center py-16 text-muted-foreground text-sm">
                              ยังไม่มีข้อมูลตารางคะแนน
                            </td>
                          </tr>
                        ) : (
                          standings.map((row, idx) => {
                            const club = clubs[row.clubId] ?? { name: row.clubId, logo: "" };
                            const isQualified = idx < 2;
                            return (
                              <tr
                                key={row.clubId}
                                className={cn(
                                  "border-b border-border/50 hover:bg-muted/20",
                                  isQualified && "bg-emerald-500/5"
                                )}
                                style={{ transition: "background-color 150ms" }}
                              >
                                <td className="text-center py-3 px-3">
                                  <span className={cn(
                                    "inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold",
                                    isQualified
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "text-muted-foreground"
                                  )}>
                                    {idx + 1}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-3">
                                    {club.logo ? (
                                      <img src={club.logo} alt={club.name} className="w-7 h-7 rounded-full object-cover border border-border shrink-0" />
                                    ) : (
                                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                                        {club.name.slice(0, 2)}
                                      </div>
                                    )}
                                    <span className="font-semibold text-foreground">{club.name}</span>
                                  </div>
                                </td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{row.played}</td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{row.won}</td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{row.drawn}</td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{row.lost}</td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{row.goalsFor}</td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{row.goalsAgainst}</td>
                                <td className="text-center py-3 px-2">
                                  <span className={cn(
                                    "font-medium",
                                    row.goalDiff > 0 ? "text-emerald-400" : row.goalDiff < 0 ? "text-red-400" : "text-muted-foreground"
                                  )}>
                                    {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                                  </span>
                                </td>
                                <td className="text-center py-3 px-3">
                                  <span className="text-base font-bold text-foreground">{row.points}</span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Legend */}
                  {standings.length > 0 && (
                    <div className="px-6 py-3 border-t border-border/50 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-emerald-500/20" />
                      <span className="text-[11px] text-muted-foreground">ผ่านเข้ารอบน็อกเอาต์</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pb-32" />
    </div>
  );
}

// ─── Page Export ────────────────────────────────────────────────
export default function StandingsPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <StandingsContent />
    </Suspense>
  );
}
