"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection, query, where, orderBy, onSnapshot, getDocs,
} from "firebase/firestore";
import type { Club } from "@/types/club";
import type { CompetitionForDraw, Group } from "@/types/tournament";
import GroupCard from "@/components/public/GroupCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DrawPublicPage() {
  const [competitions, setCompetitions] = useState<CompetitionForDraw[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch all competitions
  useEffect(() => {
    const fetchCompetitions = async () => {
      const snap = await getDocs(
        query(collection(db, "competitions"), orderBy("createdAt", "desc"))
      );
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CompetitionForDraw));
      setCompetitions(list);
      if (list.length > 0) setActiveId(list[0].id);
      if (list.length === 0) setLoading(false);
    };
    fetchCompetitions();
  }, []);

  // 2. Listen to groups + clubs for active tournament
  useEffect(() => {
    if (!activeId) return;

    const unsubGroups = onSnapshot(
      query(collection(db, "groups"), where("competitionId", "==", activeId)),
      (snap) => {
        setGroups(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() } as Group))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      }
    );

    const unsubClubs = onSnapshot(
      query(collection(db, "clubs"), where("status", "==", "active")),
      (snap) => {
        setClubs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Club)));
        setLoading(false);
      }
    );

    return () => {
      unsubGroups();
      unsubClubs();
    };
  }, [activeId]);

  // Helper
  const getGroupClubs = (group: Group): Club[] =>
    group.teamIds
      .map((id) => clubs.find((c) => c.id === id))
      .filter(Boolean) as Club[];

  const activeCompetition = competitions.find((c) => c.id === activeId);

  const gridCols = groups.length <= 2
    ? "md:grid-cols-2"
    : groups.length <= 3
      ? "md:grid-cols-3"
      : "md:grid-cols-2 lg:grid-cols-4";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 md:py-20">
      <div className="container max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold font-kanit tracking-tight text-zinc-900 dark:text-white">
            ผลการแบ่งสาย
          </h1>
          {activeCompetition && (
            <div className="flex items-center justify-center gap-3">
              <Trophy size={18} className="text-[#facc15]" />
              <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                {activeCompetition.name}
              </span>
            </div>
          )}
        </div>

        {/* Competition Tabs */}
        {competitions.length > 1 && (
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {competitions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setActiveId(c.id); setLoading(true); }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border",
                  activeId === c.id
                    ? "bg-[#facc15] text-black border-[#facc15]"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-[#facc15]/50"
                )}
                style={{ transition: "all 200ms" }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border bg-white dark:bg-zinc-900 p-6 space-y-4">
                <Skeleton className="h-8 w-24" />
                {[...Array(4)].map((__, j) => <Skeleton key={j} className="h-10 w-full" />)}
              </div>
            ))}
          </div>
        ) : groups.length === 0 || groups.every((g) => g.teamIds.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <Trophy size={36} className="text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold font-kanit text-zinc-900 dark:text-white mb-2">ยังไม่ได้แบ่งสาย</h3>
            <p className="text-muted-foreground">ผลการแบ่งสายจะแสดงที่นี่เมื่อแอดมินดำเนินการ</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                groupName={group.name}
                clubs={getGroupClubs(group)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
