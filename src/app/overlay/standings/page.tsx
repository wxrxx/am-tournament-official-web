"use client";

// OBS Browser Source Settings:
// Width: 1920 | Height: 1080
// URL: /overlay/standings?competition={id}&group=A
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

function OverlayStandingsContent() {
  const searchParams = useSearchParams();
  const competitionParam = searchParams.get("competition");
  const groupParam = searchParams.get("group"); // e.g. "A"

  const [comp, setComp] = useState<CompInfo | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string>("");
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [clubs, setClubs] = useState<ClubMap>({});
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

  // 2. Resolve group id from group name param
  useEffect(() => {
    const cid = comp?.id;
    if (!cid) return;

    const q = query(collection(db, "groups"), where("competitionId", "==", cid));
    getDocs(q).then((snap) => {
      const grps = snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name as string,
        teamIds: (d.data().teamIds as string[]) ?? [],
      })).sort((a, b) => a.name.localeCompare(b.name));

      // Match by name param or default to first group
      const target = groupParam
        ? grps.find((g) => g.name.toLowerCase() === groupParam.toLowerCase())
        : grps[0];

      if (target) {
        setGroupId(target.id);
        setGroupName(target.name);

        // Load clubs for this group
        const ids = target.teamIds;
        if (ids.length > 0) {
          const chunks: string[][] = [];
          for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30));
          Promise.all(
            chunks.map((chunk) =>
              getDocs(query(collection(db, "clubs"), where("__name__", "in", chunk)))
            )
          ).then((results) => {
            const map: ClubMap = {};
            results.forEach((s) => s.docs.forEach((d) => {
              map[d.id] = { name: (d.data().name as string) ?? "", logo: (d.data().logo as string) ?? "" };
            }));
            setClubs(map);
          });
        }
      }
    });
  }, [comp?.id, groupParam]);

  // 3. Real-time standings
  useEffect(() => {
    if (!comp?.id || !groupId) return;

    const q = query(
      collection(db, "standings"),
      where("competitionId", "==", comp.id),
      where("groupId", "==", groupId)
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
      setLoading(false);
    });

    return () => unsub();
  }, [comp?.id, groupId]);

  if (loading) {
    return (
      <div className="w-[1920px] h-[1080px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (standings.length === 0) {
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
        .row-anim {
          animation: fadeSlideIn 400ms ease forwards;
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
            <div className="flex items-center" style={{ gap: "20px" }}>
              <h1 className="text-white font-extrabold" style={{ fontSize: "48px", letterSpacing: "-0.5px" }}>
                ตารางคะแนน
              </h1>
              {/* Group badge */}
              <div className="flex items-center justify-center font-extrabold" style={{
                width: "52px", height: "52px", borderRadius: "12px",
                background: "rgba(250,204,21,0.15)", fontSize: "28px", color: "#facc15",
              }}>
                {groupName}
              </div>
            </div>
            <p style={{ fontSize: "22px", color: "rgba(255,255,255,0.4)" }}>
              {comp?.name}
            </p>
          </div>
          <div className="h-px bg-gradient-to-r from-[#facc15] via-[#facc15]/30 to-transparent mt-3" />
        </div>

        {/* ─── Table ──────────────────────────── */}
        <div
          style={{
            background: "rgba(0,0,0,0.7)",
            borderRadius: "20px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Column Headers */}
          <div
            className="flex items-center"
            style={{
              padding: "16px 28px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(250,204,21,0.08)",
            }}
          >
            <span style={{ width: "52px", fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "2px", textAlign: "center" }}>#</span>
            <span style={{ flex: 1, fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "2px" }}>ทีม</span>
            {(["เล่น", "ชนะ", "เสมอ", "แพ้", "ได้", "เสีย", "ต่าง"] as const).map((col) => (
              <span key={col} style={{ width: "64px", fontSize: "11px", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "2px", textAlign: "center" }}>
                {col}
              </span>
            ))}
            <span style={{ width: "80px", fontSize: "13px", color: "#facc15", fontWeight: 800, letterSpacing: "2px", textAlign: "center" }}>คะแนน</span>
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflowY: "hidden" }}>
            {standings.map((row, idx) => {
              const club = clubs[row.clubId] ?? { name: row.clubId, logo: "" };
              const isQualified = idx < 2;
              const goalDiffStr = row.goalDiff > 0 ? `+${row.goalDiff}` : String(row.goalDiff);

              return (
                <div
                  key={row.clubId}
                  className="row-anim flex items-center"
                  style={{
                    padding: "14px 28px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background: isQualified ? "rgba(52,211,153,0.07)" : "transparent",
                    borderLeft: isQualified ? "3px solid rgba(52,211,153,0.5)" : "3px solid transparent",
                    animationDelay: `${idx * 80}ms`,
                  }}
                >
                  {/* Rank */}
                  <div style={{ width: "52px", display: "flex", justifyContent: "center" }}>
                    <span
                      style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "14px", fontWeight: 800,
                        background: isQualified ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.06)",
                        color: isQualified ? "rgba(52,211,153,0.9)" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {idx + 1}
                    </span>
                  </div>

                  {/* Club */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "14px" }}>
                    {club.logo ? (
                      <img src={club.logo} alt={club.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid rgba(255,255,255,0.15)" }} />
                    ) : (
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>
                        {club.name.slice(0, 2)}
                      </div>
                    )}
                    <span className="font-semibold text-white" style={{ fontSize: "18px" }}>{club.name}</span>
                  </div>

                  {/* Stats */}
                  {([row.played, row.won, row.drawn, row.lost, row.goalsFor, row.goalsAgainst] as number[]).map((val, i) => (
                    <span key={i} style={{ width: "64px", textAlign: "center", fontSize: "16px", color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
                      {val}
                    </span>
                  ))}

                  {/* Goal Diff */}
                  <span style={{
                    width: "64px", textAlign: "center", fontSize: "16px", fontWeight: 600,
                    color: row.goalDiff > 0 ? "rgba(52,211,153,0.85)" : row.goalDiff < 0 ? "rgba(248,113,113,0.85)" : "rgba(255,255,255,0.4)",
                  }}>
                    {goalDiffStr}
                  </span>

                  {/* Points */}
                  <span style={{ width: "80px", textAlign: "center", fontSize: "22px", fontWeight: 800, color: "#facc15" }}>
                    {row.points}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Qualification Legend */}
          <div style={{ padding: "12px 28px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "rgba(52,211,153,0.2)", border: "1px solid rgba(52,211,153,0.4)", display: "inline-block" }} />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "1.5px", fontWeight: 600 }}>ผ่านเข้ารอบน็อกเอาต์</span>
          </div>
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

export default function OverlayStandingsPage() {
  return (
    <Suspense fallback={<div className="w-[1920px] h-[1080px] bg-transparent" />}>
      <OverlayStandingsContent />
    </Suspense>
  );
}
