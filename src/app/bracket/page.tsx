"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  orderBy,
  documentId,
} from "firebase/firestore";
import type { BracketMatch } from "@/types/bracket";
import type { Club } from "@/types/club";

import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Swords } from "lucide-react";

export default function PublicBracketPage() {
  const [competitions, setCompetitions] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompId, setSelectedCompId] = useState("");
  const [matches, setMatches] = useState<BracketMatch[]>([]);
  const [clubsMap, setClubsMap] = useState<Record<string, Club>>({});
  const [loadingComps, setLoadingComps] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Load competitions once
  useEffect(() => {
    async function fetchComps() {
      try {
        const q = query(collection(db, "competitions"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const compsData = snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name as string,
        }));
        setCompetitions(compsData);
        if (compsData.length > 0) {
          setSelectedCompId(compsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching competitions:", error);
      } finally {
        setLoadingComps(false);
      }
    }
    fetchComps();
  }, []);

  // Real-time listen to matches
  useEffect(() => {
    if (!selectedCompId) return;
    setLoadingMatches(true);

    const q = query(
      collection(db, "bracket_matches"),
      where("competitionId", "==", selectedCompId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => {
          const docData = d.data();
          return {
            id: d.id,
            ...docData,
            date: docData.date?.toDate ? docData.date.toDate().toISOString() : docData.date,
          } as BracketMatch;
        });

        // Sort locally by round ASC, position ASC
        data.sort((a, b) => {
          if (a.round !== b.round) return a.round - b.round;
          return a.position - b.position;
        });

        setMatches(data);
        setLoadingMatches(false);
      },
      (error) => {
        console.error("Error listening to bracket_matches:", error);
        setLoadingMatches(false);
      }
    );

    return () => unsubscribe();
  }, [selectedCompId]);

  // Fetch missing clubs when matches change
  useEffect(() => {
    async function fetchMissingClubs() {
      const teamIdsToFetch = new Set<string>();
      matches.forEach((m) => {
        if (m.homeTeamId && !clubsMap[m.homeTeamId]) teamIdsToFetch.add(m.homeTeamId);
        if (m.awayTeamId && !clubsMap[m.awayTeamId]) teamIdsToFetch.add(m.awayTeamId);
      });

      if (teamIdsToFetch.size === 0) return;

      const idsArray = Array.from(teamIdsToFetch);
      const newClubsMap: Record<string, Club> = {};

      // Chunk by 30 to comply with Firestore 'in' query limits
      for (let i = 0; i < idsArray.length; i += 30) {
        const chunk = idsArray.slice(i, i + 30);
        const q = query(collection(db, "clubs"), where(documentId(), "in", chunk));
        const snap = await getDocs(q);
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.status === "active") {
            newClubsMap[d.id] = { id: d.id, ...data } as Club;
          }
        });
      }

      setClubsMap((prev) => ({ ...prev, ...newClubsMap }));
    }

    if (matches.length > 0) {
      fetchMissingClubs();
    }
  }, [matches, clubsMap]);

  const getClub = (id: string) => clubsMap[id];

  // Group matches by round for visual rendering
  const rounds = useMemo(() => {
    const map = new Map<number, BracketMatch[]>();
    matches.forEach((m) => {
      const arr = map.get(m.round) || [];
      arr.push(m);
      map.set(m.round, arr);
    });
    const sortedRounds = Array.from(map.keys()).sort((a, b) => a - b);
    return sortedRounds.map((r) => map.get(r)!);
  }, [matches]);

  return (
    <div className="container py-12 space-y-8 min-h-[calc(100vh-200px)]">
      {/* Header & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">
            Knockout <span className="text-[#facc15]">Bracket</span>
          </h1>
          <p className="text-muted-foreground mt-2">สายการแข่งขันรอบน็อกเอาต์</p>
        </div>

        {loadingComps ? (
          <Skeleton className="h-12 w-full md:w-[300px] rounded-lg" />
        ) : (
          <select
            className="h-12 rounded-lg border-2 border-border bg-background px-4 text-base font-semibold min-w-[280px] focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none transition-all"
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
          >
            {competitions.length === 0 && <option value="">ไม่มีรายการแข่งขัน</option>}
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Bracket Board */}
      <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-lg relative">
        {loadingMatches ? (
          <div className="p-16 space-y-8">
            <Skeleton className="h-32 w-full max-w-4xl mx-auto rounded-xl opacity-50" />
            <Skeleton className="h-32 w-3/4 mx-auto rounded-xl opacity-30" />
            <Skeleton className="h-32 w-1/2 mx-auto rounded-xl opacity-10" />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center animate-pulse">
              <Swords size={40} className="text-muted-foreground/50" />
            </div>
            <div>
              <p className="font-bold text-2xl text-foreground">ยังไม่มีสายการแข่งขัน</p>
              <p className="text-muted-foreground mt-2">
                โปรดรอฝ่ายจัดการแข่งขันอัปเดตข้อมูลรอบน็อกเอาต์
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12 overflow-x-auto custom-scrollbar">
            <div className="flex gap-16 min-w-max pb-8 pt-12">
              {rounds.map((roundMatches, roundIndex) => (
                <div
                  key={roundIndex}
                  className="flex flex-col justify-around gap-8 w-[320px] relative"
                >
                  {/* Round Header */}
                  <div className="absolute -top-12 left-0 right-0 text-center font-black text-muted-foreground/40 uppercase tracking-widest text-xl">
                    {roundMatches[0].roundName === "F" ? (
                      <span className="text-[#facc15] flex items-center justify-center gap-2 drop-shadow-sm">
                        <Trophy size={20} /> FINAL
                      </span>
                    ) : (
                      roundMatches[0].roundName
                    )}
                  </div>

                  {roundMatches.map((match) => {
                    const home = getClub(match.homeTeamId);
                    const away = getClub(match.awayTeamId);
                    const isCompleted = match.status === "completed";
                    const hasResult = isCompleted && match.winnerId !== "";

                    const homeWon = hasResult && match.winnerId === match.homeTeamId;
                    const awayWon = hasResult && match.winnerId === match.awayTeamId;

                    return (
                      <div
                        key={match.id}
                        className="relative bg-background border-2 border-border/50 rounded-xl shadow-md transition-all hover:border-border/80"
                      >
                        {/* Live Badge */}
                        {match.status === "live" && (
                          <div className="absolute -top-3 -right-3 z-10">
                            <span className="relative flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-background"></span>
                            </span>
                          </div>
                        )}

                        {/* Match Layout */}
                        <div className="flex flex-col">
                          {/* Home Team */}
                          <div
                            className={`flex items-center justify-between p-4 border-b border-border/30 transition-all ${
                              hasResult && !homeWon ? "opacity-40 grayscale" : ""
                            } ${homeWon ? "bg-[#facc15]/10 border-l-4 border-l-[#facc15]" : "border-l-4 border-l-transparent"}`}
                          >
                            <div className="flex items-center gap-3">
                              {home?.logo ? (
                                <img
                                  src={home.logo}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover shadow-sm bg-white"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-muted rounded-full shadow-inner" />
                              )}
                              <span className={`text-base font-bold truncate max-w-[160px] ${homeWon ? "text-[#facc15]" : ""}`}>
                                {home?.name || "TBD"}
                              </span>
                            </div>
                            <span className={`text-lg font-black ${homeWon ? "text-[#facc15]" : "text-muted-foreground"}`}>
                              {isCompleted || match.status === "live" ? match.homeScore : "-"}
                            </span>
                          </div>

                          {/* Away Team */}
                          <div
                            className={`flex items-center justify-between p-4 transition-all ${
                              hasResult && !awayWon ? "opacity-40 grayscale" : ""
                            } ${awayWon ? "bg-[#facc15]/10 border-l-4 border-l-[#facc15]" : "border-l-4 border-l-transparent"}`}
                          >
                            <div className="flex items-center gap-3">
                              {away?.logo ? (
                                <img
                                  src={away.logo}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover shadow-sm bg-white"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-muted rounded-full shadow-inner" />
                              )}
                              <span className={`text-base font-bold truncate max-w-[160px] ${awayWon ? "text-[#facc15]" : ""}`}>
                                {away?.name || "TBD"}
                              </span>
                            </div>
                            <span className={`text-lg font-black ${awayWon ? "text-[#facc15]" : "text-muted-foreground"}`}>
                              {isCompleted || match.status === "live" ? match.awayScore : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Champion Column */}
              <div className="flex flex-col justify-center items-center w-[240px] pl-12 relative">
                {(() => {
                  const finalMatch = rounds[rounds.length - 1]?.[0];
                  if (finalMatch && finalMatch.status === "completed" && finalMatch.winnerId) {
                    const champ = getClub(finalMatch.winnerId);
                    return (
                      <div className="flex flex-col items-center animate-in zoom-in slide-in-from-left-8 duration-700">
                        <div className="relative">
                          {/* CSS Animation glow behind trophy */}
                          <div className="absolute inset-0 bg-[#facc15] blur-3xl opacity-20 rounded-full animate-pulse" />
                          <Trophy size={80} className="text-[#facc15] mb-6 drop-shadow-2xl relative z-10" />
                        </div>
                        {champ?.logo && (
                          <img
                            src={champ.logo}
                            alt=""
                            className="w-28 h-28 rounded-full object-cover border-4 border-[#facc15] mb-4 shadow-[0_0_30px_rgba(250,204,21,0.3)] bg-white relative z-10"
                          />
                        )}
                        <span className="text-2xl font-black text-center text-[#facc15] drop-shadow-md">
                          {champ?.name}
                        </span>
                        <span className="text-sm font-bold text-[#facc15]/60 mt-2 tracking-[0.3em] uppercase">
                          Champion
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-col items-center opacity-10 grayscale">
                      <Trophy size={80} className="mb-6" />
                      <span className="font-black tracking-widest text-xl">CHAMPION</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
