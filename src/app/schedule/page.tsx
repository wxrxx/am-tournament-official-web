"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection, query, where, orderBy, onSnapshot, getDocs, limit,
} from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────
interface CompItem { id: string; name: string; }
interface GroupItem { id: string; name: string; teamIds: string[]; }
interface ClubMap { [id: string]: { name: string; logo: string }; }

interface MatchItem {
  id: string;
  competitionId: string;
  groupId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: { toDate: () => Date } | null;
  venue: string;
  status: "scheduled" | "live" | "completed" | "postponed";
}

type TabKey = "upcoming" | "results";

// ─── Helpers ───────────────────────────────────────────────────
function fmtDate(ts: { toDate: () => Date } | null): string {
  if (!ts) return "-";
  return ts.toDate().toLocaleString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function statusBadge(s: MatchItem["status"]) {
  const map: Record<MatchItem["status"], { label: string; cls: string }> = {
    scheduled: { label: "กำหนดการ", cls: "bg-zinc-700/60 text-zinc-300" },
    live: { label: "กำลังแข่ง", cls: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" },
    completed: { label: "เสร็จสิ้น", cls: "bg-emerald-500/20 text-emerald-400" },
    postponed: { label: "เลื่อน", cls: "bg-red-500/20 text-red-400" },
  };
  const { label, cls } = map[s];
  return (
    <Badge className={cn("text-[10px] font-semibold", cls)}>
      {s === "live" && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse mr-1 inline-block" />}
      {label}
    </Badge>
  );
}

// ─── Match Card ────────────────────────────────────────────────
function MatchCard({ match, clubs, groupName }: {
  match: MatchItem;
  clubs: ClubMap;
  groupName: string;
}) {
  const home = clubs[match.homeTeamId] ?? { name: match.homeTeamId, logo: "" };
  const away = clubs[match.awayTeamId] ?? { name: match.awayTeamId, logo: "" };

  return (
    <div
      className="rounded-xl border border-border/60 bg-card hover:border-border hover:bg-muted/30 p-6"
      style={{ transition: "border-color 200ms, background-color 200ms" }}
    >
      {/* Top row: group + status */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
          สาย {groupName}
        </span>
        {statusBadge(match.status)}
      </div>

      {/* Teams */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Home */}
        <div className="flex flex-col items-center gap-2 text-center">
          {home.logo ? (
            <img src={home.logo} alt={home.name} className="w-12 h-12 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {home.name.slice(0, 2)}
            </div>
          )}
          <p className="text-sm font-semibold text-foreground leading-tight">{home.name}</p>
        </div>

        {/* Center */}
        <div className="text-center px-2">
          {match.status === "completed" ? (
            <p className="text-2xl font-bold text-foreground tabular-nums tracking-wider">
              {match.homeScore} – {match.awayScore}
            </p>
          ) : (
            <div className="bg-background border border-border px-4 py-1.5 rounded-md">
              <p className="text-lg font-bold text-foreground">VS</p>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-2 text-center">
          {away.logo ? (
            <img src={away.logo} alt={away.name} className="w-12 h-12 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {away.name.slice(0, 2)}
            </div>
          )}
          <p className="text-sm font-semibold text-foreground leading-tight">{away.name}</p>
        </div>
      </div>

      {/* Bottom: date + venue */}
      <div className="flex items-center justify-center gap-4 mt-5 text-xs text-muted-foreground">
        <span>{fmtDate(match.date)}</span>
        {match.venue && (
          <>
            <span className="w-px h-3 bg-border" />
            <span>{match.venue}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Content ──────────────────────────────────────────────
function ScheduleContent() {
  const searchParams = useSearchParams();
  const compParam = searchParams.get("competition");

  const [competitions, setCompetitions] = useState<CompItem[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [clubs, setClubs] = useState<ClubMap>({});
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("upcoming");

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

  // Load groups for selected competition
  useEffect(() => {
    if (!selectedComp) { setGroups([]); return; }
    const q = query(collection(db, "groups"), where("competitionId", "==", selectedComp));
    getDocs(q).then((snap) => {
      setGroups(
        snap.docs
          .map((d) => ({ id: d.id, name: d.data().name as string, teamIds: (d.data().teamIds as string[]) ?? [] }))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    });
  }, [selectedComp]);

  // Load clubs from groups
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

  // Real-time matches
  useEffect(() => {
    if (!selectedComp) { setMatches([]); return; }

    let q = query(
      collection(db, "matches"),
      where("competitionId", "==", selectedComp),
      orderBy("date", "asc")
    );

    if (selectedGroup) {
      q = query(
        collection(db, "matches"),
        where("competitionId", "==", selectedComp),
        where("groupId", "==", selectedGroup),
        orderBy("date", "asc")
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MatchItem)));
    });

    return () => unsub();
  }, [selectedComp, selectedGroup]);

  // Filter by tab
  const filtered = matches.filter((m) => {
    if (tab === "upcoming") return m.status === "scheduled" || m.status === "live";
    return m.status === "completed";
  });

  const groupName = (gid: string) => groups.find((g) => g.id === gid)?.name ?? "-";

  return (
    <div className="pt-16 min-h-screen bg-background">
      {/* ── Header ── */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          Match Fixtures
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-4">ตารางแข่งขัน</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          ติดตามโปรแกรมนัดแข่งขันและผลการแข่งของทุกทีม แบบเรียลไทม์
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
              {/* ── Filters ── */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Competition selector */}
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

                {/* Group filter */}
                {groups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedGroup("")}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-medium",
                        "transition-all duration-200",
                        !selectedGroup
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      ทุกสาย
                    </button>
                    {groups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGroup(g.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-medium",
                          "transition-all duration-200",
                          selectedGroup === g.id
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        สาย {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Tabs ── */}
              <div className="flex gap-1 bg-muted/40 p-1 rounded-lg w-fit">
                {([
                  { key: "upcoming" as TabKey, label: "ตารางแข่งขัน" },
                  { key: "results" as TabKey, label: "ผลการแข่ง" },
                ]).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-semibold",
                      "transition-all duration-200",
                      tab === t.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── Match List ── */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <CalendarDays size={40} className="text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {tab === "upcoming" ? "ยังไม่มีกำหนดการแข่งขัน" : "ยังไม่มีผลการแข่งขัน"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      clubs={clubs}
                      groupName={groupName(m.groupId)}
                    />
                  ))}
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
export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <ScheduleContent />
    </Suspense>
  );
}
