"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

interface CompetitionForDraw {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  teamIds: string[];
}

interface ClubMap {
  [clubId: string]: {
    name: string;
    logo: string;
  };
}

function OverlayDrawContent() {
  const searchParams = useSearchParams();
  const competitionParam = searchParams.get("competition");

  const [competition, setCompetition] = useState<CompetitionForDraw | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [clubMap, setClubMap] = useState<ClubMap>({});
  const [loading, setLoading] = useState(true);

  // 1. Fetch Competition
  useEffect(() => {
    const loadComp = async () => {
      let cid = competitionParam;
      if (cid) {
        const docSnap = await getDoc(doc(db, "competitions", cid));
        if (docSnap.exists()) {
          setCompetition({ id: docSnap.id, name: docSnap.data().name });
        }
      } else {
        const snap = await getDocs(
          query(collection(db, "competitions"), orderBy("createdAt", "desc"), limit(1))
        );
        if (!snap.empty) {
          cid = snap.docs[0].id;
          setCompetition({ id: cid, name: snap.docs[0].data().name });
        }
      }
    };
    loadComp();
  }, [competitionParam]);

  // 2. Fetch Groups & Clubs (Real-time)
  useEffect(() => {
    const cid = competition?.id
    if (!cid) return

    const unsubGroups = onSnapshot(
      query(
        collection(db, "groups"),
        where("competitionId", "==", cid)
      ),
      async (snap) => {
        const fetchedGroups = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Group))
          .sort((a, b) => a.name.localeCompare(b.name))

        setGroups(fetchedGroups)
        setLoading(false)

        const allClubIds = [
          ...new Set(fetchedGroups.flatMap((g) => g.teamIds))
        ]

        if (allClubIds.length === 0) {
          setClubMap({})
          return
        }

        const map: ClubMap = {}

        const chunks: string[][] = []
        for (let i = 0; i < allClubIds.length; i += 30) {
          chunks.push(allClubIds.slice(i, i + 30))
        }

        await Promise.all(
          chunks.map(async (chunk) => {
            const clubSnaps = await getDocs(
              query(
                collection(db, "clubs"),
                where("__name__", "in", chunk)
              )
            )
            clubSnaps.docs.forEach((d) => {
              const data = d.data()
              if (data.status === "active") {
                map[d.id] = {
                  name: data.name ?? "",
                  logo: data.logo ?? "",
                }
              }
            })
          })
        )

        setClubMap(map)
      }
    )

    return () => unsubGroups()
  }, [competition?.id])

  if (loading) {
    return (
      <div className="w-[1920px] h-[1080px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (groups.length === 0) {
    return <div className="w-[1920px] h-[1080px] bg-transparent" />;
  }

  // Calculate grid columns based on number of groups
  let gridColsClass = "grid-cols-2";
  const numGroups = groups.length;
  if (numGroups === 2) gridColsClass = "grid-cols-2";
  else if (numGroups === 3) gridColsClass = "grid-cols-3";
  else if (numGroups === 4) gridColsClass = "grid-cols-4";
  else if (numGroups >= 5 && numGroups <= 6) gridColsClass = "grid-cols-3";
  else if (numGroups >= 7) gridColsClass = "grid-cols-4";

  return (
    <>
      <style>{`
        body {
          background: transparent !important;
          margin: 0;
          padding: 0;
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .team-row {
          animation: fadeSlideIn 400ms ease forwards;
          opacity: 0; /* Initial state before animation */
        }
      `}</style>

      {/* Main Container 1920x1080 */}
      {/* OBS Browser Source Settings: */}
      {/* Width: 1920 | Height: 1080 */}
      {/* URL: /overlay/draw?competition={id} */}
      {/* ✓ Shutdown source when not visible */}
      {/* ✓ Refresh browser when scene becomes active */}
      <div 
        className="relative overflow-hidden flex flex-col font-kanit"
        style={{ width: "1920px", height: "1080px", padding: "60px 80px", gap: "40px" }}
      >
        {/* ─── Header ─────────────────────────── */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-white font-extrabold tracking-[-0.5px]" style={{ fontSize: "52px" }}>
              ตารางแบ่งสาย
            </h1>
            <p style={{ fontSize: "24px", color: "rgba(255,255,255,0.4)" }}>
              {competition?.name}
            </p>
          </div>
          <div className="h-px bg-gradient-to-r from-[#facc15] via-[#facc15]/30 to-transparent mt-3" />
        </div>

        {/* ─── Groups Grid ────────────────────── */}
        <div className={`grid ${gridColsClass} flex-1`} style={{ gap: "24px" }}>
          {groups.map((group) => (
            <div 
              key={group.id} 
              className="flex flex-col"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                overflow: "hidden"
              }}
            >
              {/* Group Header */}
              <div 
                className="flex items-center justify-between"
                style={{
                  padding: "16px 24px",
                  background: "rgba(250,204,21,0.12)",
                  borderBottom: "1px solid rgba(250,204,21,0.15)"
                }}
              >
                <div className="flex items-center">
                  <span style={{ fontSize: "13px", color: "rgba(250,204,21,0.7)" }}>สาย</span>
                  <span className="font-extrabold ml-2" style={{ fontSize: "32px", color: "#facc15" }}>
                    {group.name}
                  </span>
                </div>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
                  {group.teamIds.length} ทีม
                </span>
              </div>

              {/* Team List */}
              <div className="flex flex-col flex-1" style={{ padding: "12px 16px", gap: "8px" }}>
                {group.teamIds.map((clubId, index) => {
                  const clubInfo = clubMap[clubId] || { name: "Unknown Team", logo: "" };
                  const rank = `${group.name}${index + 1}`;

                  return (
                    <div 
                      key={`${group.id}-${clubId}`}
                      className="team-row flex items-center"
                      style={{
                        padding: "10px 14px",
                        gap: "16px",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.04)",
                        animationDelay: `${index * 80}ms`
                      }}
                    >
                      {/* อันดับ */}
                      <div 
                        className="flex items-center justify-center font-bold shrink-0"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: "rgba(250,204,21,0.15)",
                          fontSize: "13px",
                          color: "#facc15"
                        }}
                      >
                        {rank}
                      </div>

                      {/* โลโก้ทีม */}
                      <div className="shrink-0">
                        {clubInfo.logo ? (
                          <img 
                            src={clubInfo.logo} 
                            alt={clubInfo.name}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1.5px solid rgba(255,255,255,0.15)"
                            }}
                          />
                        ) : (
                          <div 
                            className="bg-zinc-800 flex items-center justify-center font-bold text-zinc-400"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              fontSize: "12px"
                            }}
                          >
                            {clubInfo.name.slice(0, 2)}
                          </div>
                        )}
                      </div>

                      {/* ชื่อทีม */}
                      <span 
                        className="font-semibold text-white flex-1"
                        style={{
                          fontSize: "18px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {clubInfo.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Footer ─────────────────────────── */}
        <p 
          className="absolute font-bold"
          style={{
            bottom: "32px",
            right: "80px",
            fontSize: "13px",
            letterSpacing: "4px",
            color: "rgba(255,255,255,0.12)"
          }}
        >
          AM TOURNAMENT
        </p>
      </div>
    </>
  );
}

export default function OverlayDrawPage() {
  return (
    <Suspense fallback={<div className="w-[1920px] h-[1080px] bg-transparent" />}>
      <OverlayDrawContent />
    </Suspense>
  );
}
