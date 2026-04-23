"use client";

// OBS Browser Source Settings:
// Width: 1920 | Height: 1080
// URL: /overlay/schedule?competition={id}
// ✓ Shutdown source when not visible
// ✓ Refresh browser when scene becomes active

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection, query, where, onSnapshot, getDocs, doc, getDoc,
  orderBy, limit,
} from "firebase/firestore";

interface CompInfo { id: string; name: string; }
interface ClubMap { [id: string]: { name: string; logo: string }; }

interface MatchItem {
  id: string;
  groupId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: { toDate: () => Date } | null;
  venue: string;
  status: "scheduled" | "live" | "completed" | "postponed";
}

interface GroupMap { [id: string]: string; }

function isToday(ts: { toDate: () => Date } | null): boolean {
  if (!ts) return false;
  const d = ts.toDate();
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function fmtTime(ts: { toDate: () => Date } | null): string {
  if (!ts) return "-";
  return ts.toDate().toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

function OverlayScheduleContent() {
  const searchParams = useSearchParams();
  const competitionParam = searchParams.get("competition");

  const [comp, setComp] = useState<CompInfo | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [clubs, setClubs] = useState<ClubMap>({});
  const [groupMap, setGroupMap] = useState<GroupMap>({});
  const [loading, setLoading] = useState(true);

  // 1. Load competition
  useEffect(() => {
    const load = async () => {
      let cid = competitionParam;
      if (cid) {
        const snap = await getDoc(doc(db, "competitions", cid));
        if (snap.exists()) setComp({ id: snap.id, name: snap.data().name as string });
      } else {
        const snap = await getDocs(
          query(collection(db, "competitions"), orderBy("createdAt", "desc"), limit(1))
        );
        if (!snap.empty) {
          cid = snap.docs[0].id;
          setComp({ id: cid, name: snap.docs[0].data().name as string });
        }
      }
    };
    load();
  }, [competitionParam]);

  // 2. Real-time matches + clubs
  useEffect(() => {
    const cid = comp?.id;
    if (!cid) return;

    // Load groups for name mapping
    getDocs(query(collection(db, "groups"), where("competitionId", "==", cid))).then((snap) => {
      const map: GroupMap = {};
      snap.docs.forEach((d) => { map[d.id] = d.data().name as string; });
      setGroupMap(map);
    });

    const unsub = onSnapshot(
      query(
        collection(db, "matches"),
        where("competitionId", "==", cid),
        orderBy("date", "asc")
      ),
      async (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MatchItem));
        const todayMatches = all.filter((m) => isToday(m.date));
        setMatches(todayMatches);
        setLoading(false);

        // Load clubs
        const allIds = [...new Set(todayMatches.flatMap((m) => [m.homeTeamId, m.awayTeamId]))];
        if (allIds.length === 0) { setClubs({}); return; }

        const chunks: string[][] = [];
        for (let i = 0; i < allIds.length; i += 30) {
          chunks.push(allIds.slice(i, i + 30));
        }

        const map: ClubMap = {};
        await Promise.all(
          chunks.map(async (chunk) => {
            const clubSnap = await getDocs(
              query(collection(db, "clubs"), where("__name__", "in", chunk))
            );
            clubSnap.docs.forEach((d) => {
              map[d.id] = { name: (d.data().name as string) ?? "", logo: (d.data().logo as string) ?? "" };
            });
          })
        );
        setClubs(map);
      }
    );

    return () => unsub();
  }, [comp?.id]);

  if (loading) {
    return (
      <div className="w-[1920px] h-[1080px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (matches.length === 0) {
    return <div className="w-[1920px] h-[1080px] bg-transparent" />;
  }

  return (
    <>
      <style>{`
        body { background: transparent !important; margin: 0; padding: 0; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .match-card {
          animation: fadeSlideIn 400ms ease forwards;
          opacity: 0;
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .live-dot { animation: livePulse 1.2s ease-in-out infinite; }
      `}</style>

      <div
        className="relative overflow-hidden flex flex-col font-kanit"
        style={{ width: "1920px", height: "1080px", padding: "60px 80px", gap: "40px" }}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-white font-extrabold tracking-[-0.5px]" style={{ fontSize: "48px" }}>
              ตารางแข่งวันนี้
            </h1>
            <p style={{ fontSize: "22px", color: "rgba(255,255,255,0.4)" }}>
              {comp?.name}
            </p>
          </div>
          <div className="h-px bg-gradient-to-r from-[#facc15] via-[#facc15]/30 to-transparent mt-3" />
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-2 gap-5 flex-1" style={{ alignContent: "start" }}>
          {matches.map((match, idx) => {
            const home = clubs[match.homeTeamId] ?? { name: "TBD", logo: "" };
            const away = clubs[match.awayTeamId] ?? { name: "TBD", logo: "" };
            const gName = groupMap[match.groupId] ?? "";
            const isLive = match.status === "live";
            const isCompleted = match.status === "completed";

            return (
              <div
                key={match.id}
                className="match-card"
                style={{
                  background: "rgba(0,0,0,0.7)",
                  borderRadius: "16px",
                  padding: "20px 28px",
                  border: isLive ? "1px solid rgba(250,204,21,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  animationDelay: `${idx * 100}ms`,
                }}
              >
                {/* Top: group + time + status */}
                <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
                  <span style={{ fontSize: "12px", color: "rgba(250,204,21,0.7)", fontWeight: 700, letterSpacing: "2px" }}>
                    สาย {gName}
                  </span>
                  <div className="flex items-center" style={{ gap: "8px" }}>
                    {isLive && (
                      <span className="live-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#facc15", display: "inline-block" }} />
                    )}
                    <span style={{
                      fontSize: "11px", fontWeight: 600,
                      color: isLive ? "#facc15" : isCompleted ? "rgba(52,211,153,0.8)" : "rgba(255,255,255,0.4)",
                    }}>
                      {isLive ? "LIVE" : isCompleted ? "FT" : fmtTime(match.date)}
                    </span>
                  </div>
                </div>

                {/* Teams row */}
                <div className="flex items-center" style={{ gap: "16px" }}>
                  {/* Home */}
                  <div className="flex items-center flex-1" style={{ gap: "12px" }}>
                    {home.logo ? (
                      <img src={home.logo} alt={home.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid rgba(255,255,255,0.15)" }} />
                    ) : (
                      <div className="flex items-center justify-center font-bold" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                        {home.name.slice(0, 2)}
                      </div>
                    )}
                    <span className="font-semibold text-white" style={{ fontSize: "16px" }}>{home.name}</span>
                  </div>

                  {/* Score / VS */}
                  {isCompleted || isLive ? (
                    <div className="flex items-center" style={{ gap: "8px", padding: "4px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.06)" }}>
                      <span className="font-bold text-white" style={{ fontSize: "22px" }}>{match.homeScore}</span>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>–</span>
                      <span className="font-bold text-white" style={{ fontSize: "22px" }}>{match.awayScore}</span>
                    </div>
                  ) : (
                    <span className="font-bold" style={{ fontSize: "14px", color: "rgba(255,255,255,0.25)", padding: "4px 12px" }}>VS</span>
                  )}

                  {/* Away */}
                  <div className="flex items-center flex-1 justify-end" style={{ gap: "12px" }}>
                    <span className="font-semibold text-white text-right" style={{ fontSize: "16px" }}>{away.name}</span>
                    {away.logo ? (
                      <img src={away.logo} alt={away.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid rgba(255,255,255,0.15)" }} />
                    ) : (
                      <div className="flex items-center justify-center font-bold" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                        {away.name.slice(0, 2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Venue */}
                {match.venue && (
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "12px", textAlign: "center" }}>
                    {match.venue}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p
          className="absolute font-bold"
          style={{ bottom: "32px", right: "80px", fontSize: "13px", letterSpacing: "4px", color: "rgba(255,255,255,0.12)" }}
        >
          AM TOURNAMENT
        </p>
      </div>
    </>
  );
}

export default function OverlaySchedulePage() {
  return (
    <Suspense fallback={<div className="w-[1920px] h-[1080px] bg-transparent" />}>
      <OverlayScheduleContent />
    </Suspense>
  );
}
