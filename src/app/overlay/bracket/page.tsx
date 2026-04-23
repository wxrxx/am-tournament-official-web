"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  documentId,
} from "firebase/firestore";
import type { BracketMatch } from "@/types/bracket";
import type { Club } from "@/types/club";

import { Trophy } from "lucide-react";

function BracketOverlayContent() {
  const searchParams = useSearchParams();
  const competitionId = searchParams.get("competition");

  const [matches, setMatches] = useState<BracketMatch[]>([]);
  const [clubsMap, setClubsMap] = useState<Record<string, Club>>({});
  const [error, setError] = useState("");

  // Listen to bracket_matches
  useEffect(() => {
    if (!competitionId) {
      setError("โปรดระบุ ?competition=ID ใน URL");
      return;
    }

    const q = query(
      collection(db, "bracket_matches"),
      where("competitionId", "==", competitionId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as BracketMatch[];

        // Sort by round and position
        data.sort((a, b) => {
          if (a.round !== b.round) return a.round - b.round;
          return a.position - b.position;
        });

        setMatches(data);
      },
      (err) => {
        console.error("Error fetching bracket_matches:", err);
        setError("ไม่สามารถดึงข้อมูลสายการแข่งขันได้");
      }
    );

    return () => unsubscribe();
  }, [competitionId]);

  // Fetch missing clubs
  useEffect(() => {
    async function fetchMissingClubs() {
      const teamIds = new Set<string>();
      matches.forEach((m) => {
        if (m.homeTeamId && !clubsMap[m.homeTeamId]) teamIds.add(m.homeTeamId);
        if (m.awayTeamId && !clubsMap[m.awayTeamId]) teamIds.add(m.awayTeamId);
      });

      if (teamIds.size === 0) return;

      const idsArray = Array.from(teamIds);
      const newMap: Record<string, Club> = {};

      for (let i = 0; i < idsArray.length; i += 30) {
        const chunk = idsArray.slice(i, i + 30);
        const q = query(collection(db, "clubs"), where(documentId(), "in", chunk));
        const snap = await getDocs(q);
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.status === "active") {
            newMap[d.id] = { id: d.id, ...data } as Club;
          }
        });
      }

      setClubsMap((prev) => ({ ...prev, ...newMap }));
    }

    if (matches.length > 0) {
      fetchMissingClubs();
    }
  }, [matches, clubsMap]);

  const getClub = (id: string) => clubsMap[id];

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

  if (error) {
    return (
      <div className="w-[1920px] h-[1080px] flex items-center justify-center bg-transparent">
        <div className="bg-black/80 px-8 py-6 rounded-2xl border-2 border-red-500 text-white text-3xl font-bold">
          {error}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return null; // Empty state for OBS = Transparent
  }

  return (
    <div className="w-[1920px] h-[1080px] bg-transparent text-white overflow-hidden font-sans relative">
      {/* Container slightly padded from edges for TV safe area */}
      <div className="absolute inset-8 flex flex-col items-center justify-center">
        {/* Title */}
        <div className="absolute top-0 left-8 bg-black/80 px-8 py-4 rounded-b-3xl border-x-4 border-b-4 border-[#facc15] shadow-2xl backdrop-blur-md">
          <h1 className="text-4xl font-black uppercase tracking-widest text-[#facc15]">
            Knockout <span className="text-white">Bracket</span>
          </h1>
        </div>

        {/* Bracket Content */}
        <div className="flex gap-20 items-center justify-center w-full h-full pt-16">
          {rounds.map((roundMatches, roundIndex) => (
            <div
              key={roundIndex}
              className="flex flex-col justify-around h-full py-16 gap-8 w-[380px]"
            >
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
                    className="relative bg-black/70 backdrop-blur-md rounded-2xl border-2 border-zinc-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden"
                  >
                    {/* Live Indicator */}
                    {match.status === "live" && (
                      <div className="absolute -top-3 -right-3 z-10 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-black animate-pulse">
                        LIVE
                      </div>
                    )}
                    
                    {/* Round Label (Only show on first match of the round) */}
                    {match.position === 1 && (
                       <div className="absolute -top-8 left-0 text-zinc-400 font-bold tracking-widest text-lg uppercase">
                         {match.roundName}
                       </div>
                    )}

                    <div className="flex flex-col">
                      {/* Home */}
                      <div
                        className={`flex items-center justify-between p-4 border-b border-zinc-700/50 ${
                          hasResult && !homeWon ? "opacity-30 grayscale" : ""
                        } ${homeWon ? "bg-[#facc15]/10 border-l-8 border-l-[#facc15]" : "border-l-8 border-l-transparent"}`}
                      >
                        <div className="flex items-center gap-4">
                          {home?.logo ? (
                            <img
                              src={home.logo}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover bg-white shadow-inner"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-zinc-800 rounded-full" />
                          )}
                          <span className={`text-xl font-bold truncate max-w-[180px] ${homeWon ? "text-[#facc15]" : "text-white"}`}>
                            {home?.name || "TBD"}
                          </span>
                        </div>
                        <span className={`text-2xl font-black ${homeWon ? "text-[#facc15]" : "text-zinc-400"}`}>
                          {isCompleted || match.status === "live" ? match.homeScore : "-"}
                        </span>
                      </div>

                      {/* Away */}
                      <div
                        className={`flex items-center justify-between p-4 ${
                          hasResult && !awayWon ? "opacity-30 grayscale" : ""
                        } ${awayWon ? "bg-[#facc15]/10 border-l-8 border-l-[#facc15]" : "border-l-8 border-l-transparent"}`}
                      >
                        <div className="flex items-center gap-4">
                          {away?.logo ? (
                            <img
                              src={away.logo}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover bg-white shadow-inner"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-zinc-800 rounded-full" />
                          )}
                          <span className={`text-xl font-bold truncate max-w-[180px] ${awayWon ? "text-[#facc15]" : "text-white"}`}>
                            {away?.name || "TBD"}
                          </span>
                        </div>
                        <span className={`text-2xl font-black ${awayWon ? "text-[#facc15]" : "text-zinc-400"}`}>
                          {isCompleted || match.status === "live" ? match.awayScore : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Champion */}
          <div className="flex flex-col justify-center items-center w-[300px] relative h-full">
            {(() => {
              const finalMatch = rounds[rounds.length - 1]?.[0];
              if (finalMatch && finalMatch.status === "completed" && finalMatch.winnerId) {
                const champ = getClub(finalMatch.winnerId);
                return (
                  <div className="flex flex-col items-center bg-black/80 p-12 rounded-[3rem] border-4 border-[#facc15] shadow-[0_0_50px_rgba(250,204,21,0.5)] backdrop-blur-xl transform scale-110 relative z-20">
                    <Trophy size={120} className="text-[#facc15] mb-8 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]" />
                    {champ?.logo && (
                      <img
                        src={champ.logo}
                        alt=""
                        className="w-40 h-40 rounded-full object-cover border-8 border-[#facc15] mb-6 shadow-2xl bg-white"
                      />
                    )}
                    <span className="text-4xl font-black text-center text-[#facc15] drop-shadow-lg">
                      {champ?.name}
                    </span>
                    <span className="text-xl font-bold text-white mt-4 tracking-[0.5em] uppercase">
                      Champion
                    </span>
                  </div>
                );
              }
              return (
                <div className="flex flex-col items-center opacity-20 grayscale">
                  <Trophy size={120} className="mb-6" />
                  <span className="font-black tracking-widest text-3xl">CHAMPION</span>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BracketOverlayPage() {
  // Required by Next.js 15 for useSearchParams in Client Components
  return (
    <Suspense fallback={null}>
      <BracketOverlayContent />
    </Suspense>
  );
}
