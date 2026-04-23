"use client";

// OBS Browser Source Settings:
// Width: 1920 | Height: 1080
// URL: /overlay/results?competition={id}
// ✓ Shutdown source when not visible
// ✓ Refresh browser when scene becomes active

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection, query, where, onSnapshot, getDocs,
  doc, getDoc, orderBy, limit,
} from "firebase/firestore";

interface CompInfo { id: string; name: string; }
interface ClubMap { [id: string]: { name: string; logo: string }; }
interface GroupMap { [id: string]: string; }

interface MatchItem {
  id: string;
  groupId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: { toDate: () => Date } | null;
  venue: string;
  status: string;
}

function fmtDate(ts: { toDate: () => Date } | null): string {
  if (!ts) return "-";
  return ts.toDate().toLocaleString("th-TH", {
    day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

function OverlayResultsContent() {
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

  // 2. Real-time completed matches (latest 5)
  useEffect(() => {
    const cid = comp?.id;
    if (!cid) return;

    // Load group names
    getDocs(query(collection(db, "groups"), where("competitionId", "==", cid))).then((snap) => {
      const map: GroupMap = {};
      snap.docs.forEach((d) => { map[d.id] = d.data().name as string; });
      setGroupMap(map);
    });

    const unsub = onSnapshot(
      query(
        collection(db, "matches"),
        where("competitionId", "==", cid),
        where("status", "==", "completed"),
        orderBy("date", "desc"),
        limit(5)
      ),
      async (snap) => {
        const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MatchItem));
        setMatches(results);
        setLoading(false);

        // Load clubs
        const allIds = [...new Set(results.flatMap((m) => [m.homeTeamId, m.awayTeamId]))];
        if (allIds.length === 0) { setClubs({}); return; }

        const chunks: string[][] = [];
        for (let i = 0; i < allIds.length; i += 30) chunks.push(allIds.slice(i, i + 30));

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
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .result-card {
          animation: fadeSlideIn 450ms ease forwards;
          opacity: 0;
        }
      `}</style>

      <div
        className="relative overflow-hidden flex flex-col font-kanit"
        style={{ width: "1920px", height: "1080px", padding: "60px 80px", gap: "40px" }}
      >
        {/* ─── Header ─────────────────────────── */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-white font-extrabold" style={{ fontSize: "48px", letterSpacing: "-0.5px" }}>
              ผลการแข่งขันล่าสุด
            </h1>
            <p style={{ fontSize: "22px", color: "rgba(255,255,255,0.4)" }}>
              {comp?.name}
            </p>
          </div>
          <div className="h-px bg-gradient-to-r from-[#facc15] via-[#facc15]/30 to-transparent mt-3" />
        </div>

        {/* ─── Results List ───────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          {matches.map((match, idx) => {
            const home = clubs[match.homeTeamId] ?? { name: "TBD", logo: "" };
            const away = clubs[match.awayTeamId] ?? { name: "TBD", logo: "" };
            const gName = groupMap[match.groupId] ?? "";
            const homeWin = match.homeScore > match.awayScore;
            const awayWin = match.awayScore > match.homeScore;

            return (
              <div
                key={match.id}
                className="result-card flex items-center"
                style={{
                  background: "rgba(0,0,0,0.7)",
                  borderRadius: "16px",
                  padding: "22px 36px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  animationDelay: `${idx * 100}ms`,
                  gap: "24px",
                }}
              >
                {/* Group + Date */}
                <div style={{ width: "140px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", color: "rgba(250,204,21,0.7)", fontWeight: 700, letterSpacing: "2px" }}>
                    สาย {gName}
                  </span>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
                    {fmtDate(match.date)}
                  </span>
                </div>

                {/* Home Team */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "14px" }}>
                  <span className="font-semibold" style={{
                    fontSize: "20px",
                    color: homeWin ? "white" : "rgba(255,255,255,0.5)",
                  }}>
                    {home.name}
                  </span>
                  {home.logo ? (
                    <img src={home.logo} alt={home.name} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid rgba(255,255,255,0.15)" }} />
                  ) : (
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>
                      {home.name.slice(0, 2)}
                    </div>
                  )}
                </div>

                {/* Score */}
                <div className="flex items-center" style={{
                  gap: "12px", padding: "8px 20px",
                  borderRadius: "10px", background: "rgba(255,255,255,0.06)",
                  minWidth: "120px", justifyContent: "center",
                }}>
                  <span className="font-bold" style={{ fontSize: "28px", color: homeWin ? "#facc15" : "white" }}>
                    {match.homeScore}
                  </span>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>–</span>
                  <span className="font-bold" style={{ fontSize: "28px", color: awayWin ? "#facc15" : "white" }}>
                    {match.awayScore}
                  </span>
                </div>

                {/* Away Team */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "14px" }}>
                  {away.logo ? (
                    <img src={away.logo} alt={away.name} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid rgba(255,255,255,0.15)" }} />
                  ) : (
                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>
                      {away.name.slice(0, 2)}
                    </div>
                  )}
                  <span className="font-semibold" style={{
                    fontSize: "20px",
                    color: awayWin ? "white" : "rgba(255,255,255,0.5)",
                  }}>
                    {away.name}
                  </span>
                </div>

                {/* FT badge */}
                <span style={{
                  fontSize: "10px", fontWeight: 700, letterSpacing: "2px",
                  color: "rgba(52,211,153,0.7)", background: "rgba(52,211,153,0.1)",
                  padding: "4px 10px", borderRadius: "6px",
                }}>
                  FT
                </span>
              </div>
            );
          })}
        </div>

        {/* ─── Footer ─────────────────────────── */}
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

export default function OverlayResultsPage() {
  return (
    <Suspense fallback={<div className="w-[1920px] h-[1080px] bg-transparent" />}>
      <OverlayResultsContent />
    </Suspense>
  );
}
