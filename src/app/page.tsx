"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import type { News } from "@/types/news";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompetitionItem {
  id: string;
  name: string;
  startDate: string;
}

interface StandingRow {
  clubId: string;
  points: number;
  goalDiff: number;
  goalsFor: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
}

interface ClubInfo {
  name: string;
  logo: string;
}

interface MatchItem {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: { toDate: () => Date } | string;
  venue: string;
  status: "scheduled" | "live" | "completed" | "postponed";
  groupId: string;
}

interface GroupItem {
  id: string;
  name: string;
  teamIds: string[];
}

interface ChampionRecord {
  id: string;
  competitionName: string;
  season: string;
  year: number;
  champion: string;
  runnerUp: string;
  thirdPlace: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(value: News["publishedAt"]): string {
  try {
    const d =
      typeof value === "object" && "toDate" in value
        ? value.toDate()
        : new Date(value as string);
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function snippet(text: string, max = 60): string {
  const clean = text.replace(/<[^>]+>/g, "").trim();
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
}

// ─── Skeleton blocks ──────────────────────────────────────────────────────────

function AnnouncementSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex border-b border-border/50 min-h-[68px]">
          <div className="w-1 shrink-0 bg-border" />
          <div className="flex-1 px-[18px] py-[14px] space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </>
  );
}

function NewsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-[60px] w-full" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-10" />
        </div>
      ))}
    </div>
  );
}

function StandingSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2 py-2 border-b border-border/50"
        >
          <Skeleton className="h-3 w-4 shrink-0" />
          <Skeleton className="h-[18px] w-[18px] shrink-0" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-6" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  // ── Latest competition
  const [latestComp, setLatestComp] = useState<CompetitionItem | null>(null);

  // ── News / announcements
  const [allNews, setAllNews] = useState<News[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // ── Standings
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [clubMap, setClubMap] = useState<Record<string, ClubInfo>>({});
  const [standingsLoading, setStandingsLoading] = useState(true);

  // ── Matches
  const [allMatches, setAllMatches] = useState<MatchItem[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchClubMap, setMatchClubMap] = useState<Record<string, ClubInfo>>({});

  // ── Active clubs (for clubs section)
  const [activeClubs, setActiveClubs] = useState<(ClubInfo & { id: string })[]>([]);
  const [clubsLoading, setClubsLoading] = useState(true);

  // ── Groups (for zone mapping)
  const [groupList, setGroupList] = useState<GroupItem[]>([]);

  // ── Champions
  const [championsData, setChampionsData] = useState<ChampionRecord[]>([]);
  const [championsLoading, setChampionsLoading] = useState(true);

  // ── Fetch latest competition (once)
  useEffect(() => {
    const q = query(
      collection(db, "competitions"),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    getDocs(q).then((snap) => {
      if (!snap.empty) {
        const d = snap.docs[0];
        const data = d.data();
        setLatestComp({
          id: d.id,
          name: (data.name as string) ?? "",
          startDate: (data.startDate as string) ?? "",
        });
      }
    }).catch(() => {});
  }, []);

  // ── onSnapshot news (published, desc by publishedAt, limit 4)
  useEffect(() => {
    const q = query(
      collection(db, "news"),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
      limit(4)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: (data.title as string) ?? "",
            content: (data.content as string) ?? "",
            coverImage: (data.coverImage as string) ?? "",
            category: (data.category as "news" | "highlight") ?? "news",
            status: (data.status as "draft" | "published") ?? "published",
            publishedAt: data.publishedAt ?? "",
            authorId: (data.authorId as string) ?? "",
            authorName: (data.authorName as string) ?? "",
            videoUrl: data.videoUrl as string | undefined,
          } satisfies News;
        });
        setAllNews(docs);
        setNewsLoading(false);
      },
      () => setNewsLoading(false)
    );
    return () => unsub();
  }, []);

  // ── onSnapshot matches (orderBy date desc, limit 10, filter client)
  useEffect(() => {
    if (!latestComp) return;
    const q = query(
      collection(db, "matches"),
      where("competitionId", "==", latestComp.id),
      orderBy("date", "desc"),
      limit(10)
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs: MatchItem[] = snap.docs.map((d) => ({
        id: d.id,
        homeTeamId: (d.data().homeTeamId as string) ?? "",
        awayTeamId: (d.data().awayTeamId as string) ?? "",
        homeScore: (d.data().homeScore as number) ?? 0,
        awayScore: (d.data().awayScore as number) ?? 0,
        date: d.data().date ?? "",
        venue: (d.data().venue as string) ?? "",
        status: (d.data().status as MatchItem["status"]) ?? "scheduled",
        groupId: (d.data().groupId as string) ?? "",
      }));
      setAllMatches(docs);
      setMatchesLoading(false);
      // fetch clubs chunk 30
      const ids = [...new Set(docs.flatMap((m) => [m.homeTeamId, m.awayTeamId]))].filter(Boolean);
      if (!ids.length) return;
      const chunks: string[][] = [];
      for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30));
      Promise.all(chunks.map((c) => getDocs(query(collection(db, "clubs"), where("__name__", "in", c))))).then((rs) => {
        const map: Record<string, ClubInfo> = {};
        rs.forEach((s) => s.docs.forEach((cd) => {
          const data = cd.data();
          map[cd.id] = { name: (data.name as string) ?? "", logo: (data.logo as string) ?? "" };
        }));
        setMatchClubMap(map);
      }).catch(() => {});
    }, () => setMatchesLoading(false));
    return () => unsub();
  }, [latestComp]);

  // ── onSnapshot active clubs
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "clubs"), orderBy("name", "asc")),
      (snap) => {
        const list = snap.docs
          .filter((d) => (d.data().status as string) === "active")
          .map((d) => ({ id: d.id, name: (d.data().name as string) ?? "", logo: (d.data().logo as string) ?? "" }));
        setActiveClubs(list);
        setClubsLoading(false);
      },
      () => setClubsLoading(false)
    );
    return () => unsub();
  }, []);

  // ── getDocs groups for zone mapping
  useEffect(() => {
    if (!latestComp) return;
    getDocs(query(collection(db, "groups"), where("competitionId", "==", latestComp.id))).then((snap) => {
      setGroupList(snap.docs.map((d) => ({
        id: d.id,
        name: (d.data().name as string) ?? "",
        teamIds: (d.data().teamIds as string[]) ?? [],
      })));
    }).catch(() => {});
  }, [latestComp]);

  // ── onSnapshot champions limit 3
  useEffect(() => {
    const q = query(collection(db, "champions"), orderBy("year", "desc"), limit(3));
    const unsub = onSnapshot(q, (snap) => {
      setChampionsData(snap.docs.map((d) => ({
        id: d.id,
        competitionName: (d.data().competitionName as string) ?? "",
        season: (d.data().season as string) ?? "",
        year: (d.data().year as number) ?? 0,
        champion: (d.data().champion as string) ?? "",
        runnerUp: (d.data().runnerUp as string) ?? "",
        thirdPlace: (d.data().thirdPlace as string) ?? "",
      })));
      setChampionsLoading(false);
    }, () => setChampionsLoading(false));
    return () => unsub();
  }, []);

  // ── onSnapshot standings for latest competition
  useEffect(() => {
    if (!latestComp) return;
    setStandingsLoading(true);

    const q = query(
      collection(db, "standings"),
      where("competitionId", "==", latestComp.id)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: StandingRow[] = snap.docs.map((d) => ({
          clubId: (d.data().clubId as string) ?? "",
          points: (d.data().points as number) ?? 0,
          goalDiff: (d.data().goalDiff as number) ?? 0,
          goalsFor: (d.data().goalsFor as number) ?? 0,
          played: (d.data().played as number) ?? 0,
          won: (d.data().won as number) ?? 0,
          drawn: (d.data().drawn as number) ?? 0,
          lost: (d.data().lost as number) ?? 0,
        }));
        rows.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
          return b.goalsFor - a.goalsFor;
        });
        setStandings(rows.slice(0, 6));
        setStandingsLoading(false);

        // Fetch clubs in chunk 30
        const ids = [...new Set(rows.map((r) => r.clubId))].filter(Boolean);
        if (ids.length === 0) return;
        const chunks: string[][] = [];
        for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30));
        Promise.all(
          chunks.map((chunk) =>
            getDocs(
              query(collection(db, "clubs"), where("__name__", "in", chunk))
            )
          )
        ).then((results) => {
          const map: Record<string, ClubInfo> = {};
          results.forEach((s) =>
            s.docs.forEach((cd) => {
              const data = cd.data();
              if ((data.status as string) === "active") {
                map[cd.id] = {
                  name: (data.name as string) ?? "",
                  logo: (data.logo as string) ?? "",
                };
              }
            })
          );
          setClubMap(map);
        }).catch(() => {});
      },
      () => setStandingsLoading(false)
    );
    return () => unsub();
  }, [latestComp]);

  // ── Derived: announcements (all 4, shown in hero right col)
  const announcements = allNews;

  // ── Derived: news grid (client filter)
  const newsItems = useMemo(
    () => allNews.filter((n) => n.category === "news").slice(0, 2),
    [allNews]
  );
  const highlightItems = useMemo(
    () => allNews.filter((n) => n.category === "highlight").slice(0, 2),
    [allNews]
  );
  const contentNews = useMemo(
    () => [...newsItems, ...highlightItems],
    [newsItems, highlightItems]
  );

  // ── Derived: recent matches (completed + live, 3 latest)
  const recentMatches = useMemo(
    () =>
      allMatches
        .filter((m) => m.status === "completed" || m.status === "live")
        .slice(0, 3),
    [allMatches]
  );

  // ── Derived: upcoming matches (scheduled, soonest first, 3)
  const upcomingMatches = useMemo(() => {
    const scheduled = allMatches.filter((m) => m.status === "scheduled");
    scheduled.sort((a, b) => {
      const da = typeof a.date === "object" && "toDate" in a.date ? a.date.toDate().getTime() : new Date(a.date as string).getTime();
      const db2 = typeof b.date === "object" && "toDate" in b.date ? b.date.toDate().getTime() : new Date(b.date as string).getTime();
      return da - db2;
    });
    return scheduled.slice(0, 3);
  }, [allMatches]);

  // ── Season year from competition
  const seasonYear = latestComp?.startDate
    ? new Date(latestComp.startDate).getFullYear()
    : new Date().getFullYear();

  // ─── Announcement accent color ──────────────────────────────────────────────
  function accentStyle(cat: "news" | "highlight"): React.CSSProperties {
    if (cat === "news") return { backgroundColor: "#d1d5db" };  // gray-300
    return { backgroundColor: "#facc15" }; // yellow
  }

  function catLabel(cat: "news" | "highlight"): string {
    if (cat === "news") return "ข่าวสาร";
    return "ไฮไลต์";
  }

  function catLabelColor(cat: "news" | "highlight"): string {
    if (cat === "news") return "text-muted-foreground";
    return "text-[#facc15]";
  }

  // ─── Logo cell ──────────────────────────────────────────────────────────────
  function ClubLogoCell({ club, size = 18 }: { club: ClubInfo | undefined; size?: number }) {
    if (club?.logo) {
      return (
        <img
          src={club.logo}
          alt={club?.name ?? ""}
          width={size}
          height={size}
          style={{ width: size, height: size }}
          className="object-cover border border-border/50"
        />
      );
    }
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground border border-border/50 shrink-0"
      >
        {club?.name?.slice(0, 2) ?? "–"}
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ paddingTop: "var(--nav-height)" }}>

      {/* ══ HERO SECTION ══════════════════════════════════════════════════════ */}
      <section
        className="border-b border-border/50 flex flex-col lg:flex-row"
        style={{ minHeight: 320 }}
      >
        {/* Left col — brand */}
        <div
          className="border-b lg:border-b-0 lg:border-r border-border/50 flex flex-col justify-between"
          style={{ padding: "52px 28px", flex: "1 1 auto" }}
        >
          {/* Top */}
          <div className="space-y-4">
            {/* Season tag */}
            <div className="flex items-center gap-2">
              <span
                className="inline-block rounded-none"
                style={{ width: 7, height: 7, backgroundColor: "#facc15", flexShrink: 0 }}
              />
              <span
                className="text-muted-foreground"
                style={{ fontSize: 11, letterSpacing: "0.08em", fontWeight: 500, textTransform: "uppercase" }}
              >
                Season {seasonYear}
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-foreground"
              style={{
                fontSize: "clamp(28px, 5vw, 38px)",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-1.5px",
              }}
            >
              ฟุตบอล
              <br />
              สมัครเล่น
              <br />
              <span style={{ color: "#facc15" }}>จ.สตูล</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-muted-foreground max-w-xs"
              style={{ fontSize: 13, lineHeight: 1.7 }}
            >
              ติดตามผลการแข่งขัน ตารางคะแนน และข่าวสารล่าสุดของ
              ฟุตบอลสมัครเล่นจังหวัดสตูล ครบจบในที่เดียว
            </p>
          </div>

          {/* Bottom — CTA */}
          <div className="flex flex-wrap gap-3 mt-10">
            <Link
              href="/schedule"
              className="inline-flex items-center gap-1 font-semibold transition-opacity hover:opacity-80"
              style={{
                backgroundColor: "#facc15",
                color: "#000",
                fontSize: 13,
                padding: "9px 18px",
                borderRadius: 0,
              }}
            >
              ดูตารางแข่ง →
            </Link>
            <Link
              href="/register-team"
              className="inline-flex items-center gap-1 font-semibold border border-border text-foreground transition-colors hover:border-foreground/60"
              style={{ fontSize: 13, padding: "9px 18px", borderRadius: 0 }}
            >
              สมัครทีม
            </Link>
          </div>
        </div>

        {/* Right col — announcements */}
        <div className="flex flex-col" style={{ width: "100%", maxWidth: 420, paddingTop: "var(--nav-height)" }}>
          {/* Header */}
          <div
            className="flex items-center justify-between border-b border-border/50"
            style={{ padding: "16px 24px" }}
          >
            <span
              className="text-muted-foreground font-semibold"
              style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}
            >
              ประกาศล่าสุด
            </span>
            <Link
              href="/news"
              className="font-semibold hover:opacity-70 transition-opacity"
              style={{ fontSize: 11, color: "#facc15" }}
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {/* List */}
          {newsLoading ? (
            <AnnouncementSkeleton />
          ) : announcements.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground" style={{ fontSize: 12 }}>
                ยังไม่มีประกาศ
              </p>
            </div>
          ) : (
            announcements.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                className="flex items-stretch border-b border-border/50 hover:bg-muted/30 transition-colors"
                style={{ minHeight: 68 }}
              >
                {/* Accent bar */}
                <div
                  className="shrink-0"
                  style={{ width: 4, ...accentStyle(item.category) }}
                />
                {/* Body */}
                <div className="flex-1 py-[14px] px-[18px]">
                  <div
                    className="flex items-center gap-1.5 mb-1"
                    style={{ fontSize: 10 }}
                  >
                    <span className={`font-semibold ${catLabelColor(item.category)}`}>
                      {catLabel(item.category)}
                    </span>
                    <span
                      className="rounded-full bg-muted-foreground/40 inline-block"
                      style={{ width: 3, height: 3 }}
                    />
                    <span className="text-muted-foreground">{formatDate(item.publishedAt)}</span>
                  </div>
                  <p
                    className="text-foreground font-medium leading-snug"
                    style={{ fontSize: 12, lineHeight: 1.5 }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-muted-foreground mt-0.5 line-clamp-1"
                    style={{ fontSize: 11 }}
                  >
                    {snippet(item.content)}
                  </p>
                </div>
                {/* Arrow */}
                <div
                  className="shrink-0 flex items-center pr-3 text-muted-foreground"
                  style={{ fontSize: 16 }}
                >
                  ›
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ══ CONTENT SECTION ═══════════════════════════════════════════════════ */}
      <section className="border-b border-border/50 flex flex-col lg:flex-row">

        {/* Left 2/3 — news grid */}
        <div
          className="border-b lg:border-b-0 lg:border-r border-border/50"
          style={{ padding: 28, flex: "2 1 0" }}
        >
          {/* Section header */}
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-foreground font-semibold"
              style={{ fontSize: 13, letterSpacing: "0.02em" }}
            >
              ข่าวสารและไฮไลต์
            </h2>
            <Link
              href="/news"
              className="text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: 11 }}
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {/* 2×2 grid */}
          {newsLoading ? (
            <NewsSkeleton />
          ) : contentNews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8" style={{ fontSize: 12 }}>
              ยังไม่มีข่าวสาร
            </p>
          ) : (
            <div
              className="grid gap-5"
              style={{
                gridTemplateColumns: "repeat(2, minmax(0,1fr))",
              }}
            >
              {contentNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="group flex flex-col gap-2 hover:opacity-90 transition-opacity"
                >
                  {/* Cover */}
                  <div
                    className="border border-border/50 overflow-hidden bg-muted shrink-0"
                    style={{ height: 60 }}
                  >
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span
                          className="text-muted-foreground"
                          style={{ fontSize: 11 }}
                        >
                          {item.category === "highlight" ? "🎬" : "📰"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Category label */}
                  <span
                    className="font-semibold uppercase"
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      color: item.category === "news" ? "#facc15" : "#9ca3af",
                    }}
                  >
                    {catLabel(item.category)}
                  </span>

                  {/* Title */}
                  <p
                    className="text-foreground font-medium line-clamp-2 group-hover:text-primary transition-colors"
                    style={{ fontSize: 12, lineHeight: 1.5 }}
                  >
                    {item.title}
                  </p>

                  {/* Date */}
                  <span className="text-muted-foreground" style={{ fontSize: 10 }}>
                    {formatDate(item.publishedAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right 1/3 — standings */}
        <div style={{ padding: 28, flex: "1 1 0", minWidth: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-foreground font-semibold"
              style={{ fontSize: 13 }}
            >
              ตารางคะแนน
            </h2>
            <Link
              href="/standings"
              className="text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: 11 }}
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {standingsLoading ? (
            <StandingSkeleton />
          ) : standings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8" style={{ fontSize: 12 }}>
              ยังไม่มีข้อมูล
            </p>
          ) : (
            <div>
              {standings.map((row, idx) => {
                const club = clubMap[row.clubId];
                const isFirst = idx === 0;
                return (
                  <div
                    key={row.clubId}
                    className="flex items-center gap-2 border-b border-border/50"
                    style={{ padding: "7px 0" }}
                  >
                    {/* Rank */}
                    <span
                      className="shrink-0 font-bold tabular-nums"
                      style={{
                        width: 16,
                        fontSize: 11,
                        color: isFirst ? "#facc15" : "var(--muted-foreground)",
                      }}
                    >
                      {idx + 1}
                    </span>

                    {/* Logo */}
                    <div className="shrink-0">
                      <ClubLogoCell club={club} size={18} />
                    </div>

                    {/* Name */}
                    <span
                      className="flex-1 truncate text-foreground"
                      style={{ fontSize: 11, fontWeight: 500 }}
                    >
                      {club?.name ?? row.clubId}
                    </span>

                    {/* Goal diff */}
                    <span
                      className="text-muted-foreground tabular-nums shrink-0"
                      style={{ fontSize: 10 }}
                    >
                      {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                    </span>

                    {/* Points */}
                    <span
                      className="shrink-0 font-bold tabular-nums"
                      style={{
                        width: 24,
                        fontSize: 12,
                        textAlign: "right",
                        color: isFirst ? "#facc15" : "var(--foreground)",
                      }}
                    >
                      {row.points}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══ SECTION 3: แมตช์ล่าสุด ═════════════════════════════════════════ */}
      <section className="border-b border-border/50" style={{ padding: "28px 28px 24px" }}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-muted-foreground font-semibold uppercase" style={{ fontSize: 10, letterSpacing: "0.12em" }}>แมตช์ล่าสุด</span>
          <Link href="/results" className="font-semibold hover:opacity-70 transition-opacity" style={{ fontSize: 11, color: "#facc15" }}>ดูทั้งหมด →</Link>
        </div>
        {matchesLoading ? (
          <div className="space-y-0">{[1,2,3].map((i) => <div key={i} className="flex items-center gap-3 py-3 border-b border-border/50"><Skeleton className="h-4 flex-1" /><Skeleton className="h-5 w-14" /><Skeleton className="h-4 flex-1" /></div>)}</div>
        ) : recentMatches.length === 0 ? (
          <p className="text-muted-foreground text-center py-6" style={{ fontSize: 12 }}>ยังไม่มีผลการแข่งขัน</p>
        ) : (
          <div>
            {recentMatches.map((m) => {
              const home = matchClubMap[m.homeTeamId];
              const away = matchClubMap[m.awayTeamId];
              const grp = groupList.find((g) => g.id === m.groupId);
              const isLive = m.status === "live";
              return (
                <div key={m.id} className="flex items-center border-b border-border/50 py-3" style={{ borderLeft: isLive ? "2px solid #facc15" : "2px solid transparent", paddingLeft: 10 }}>
                  {/* Home */}
                  <div className="flex items-center gap-2" style={{ flex: 1, justifyContent: "flex-end" }}>
                    <span className="truncate text-foreground font-medium" style={{ fontSize: 11 }}>{home?.name ?? m.homeTeamId}</span>
                    <ClubLogoCell club={home} size={22} />
                  </div>
                  {/* Score */}
                  <div className="flex flex-col items-center px-4" style={{ minWidth: 64 }}>
                    {isLive && <span className="font-bold uppercase" style={{ fontSize: 8, color: "#facc15", letterSpacing: "0.1em", marginBottom: 1 }}>Live</span>}
                    <span className="font-black tabular-nums" style={{ fontSize: 18, color: isLive ? "#facc15" : "var(--foreground)" }}>
                      {m.homeScore} – {m.awayScore}
                    </span>
                    {grp && <span className="text-muted-foreground" style={{ fontSize: 9 }}>สาย {grp.name}</span>}
                  </div>
                  {/* Away */}
                  <div className="flex items-center gap-2" style={{ flex: 1 }}>
                    <ClubLogoCell club={away} size={22} />
                    <span className="truncate text-foreground font-medium" style={{ fontSize: 11 }}>{away?.name ?? m.awayTeamId}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══ SECTION 4: แมตช์ที่กำลังจะมาถึง ════════════════════════════════ */}
      <section className="border-b border-border/50" style={{ padding: "28px 28px 24px" }}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-muted-foreground font-semibold uppercase" style={{ fontSize: 10, letterSpacing: "0.12em" }}>แมตช์ที่กำลังจะมาถึง</span>
          <Link href="/schedule" className="font-semibold hover:opacity-70 transition-opacity" style={{ fontSize: 11, color: "#facc15" }}>ดูตารางแข่ง →</Link>
        </div>
        {matchesLoading ? (
          <div className="am-upcoming-grid">{[1,2,3].map((i) => <Skeleton key={i} className="h-[110px] w-full" />)}</div>
        ) : upcomingMatches.length === 0 ? (
          <p className="text-muted-foreground text-center py-6" style={{ fontSize: 12 }}>ยังไม่มีแมตช์ที่กำหนดการ</p>
        ) : (
          <div className="am-upcoming-grid">
            {upcomingMatches.map((m) => {
              const home = matchClubMap[m.homeTeamId];
              const away = matchClubMap[m.awayTeamId];
              const grp = groupList.find((g) => g.id === m.groupId);
              const dateObj = typeof m.date === "object" && "toDate" in m.date ? m.date.toDate() : m.date ? new Date(m.date as string) : null;
              return (
                <div key={m.id} className="border border-border/50 flex flex-col items-center" style={{ padding: "16px 20px" }}>
                  <span className="text-muted-foreground uppercase mb-3" style={{ fontSize: 9, letterSpacing: "0.1em" }}>
                    {dateObj ? dateObj.toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" }) : "–"}
                    {dateObj ? " · " + dateObj.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                  <div className="flex items-center w-full gap-2">
                    <div className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                      <ClubLogoCell club={home} size={28} />
                      <span className="text-foreground font-medium text-center leading-tight" style={{ fontSize: 10 }}>{home?.name ?? m.homeTeamId}</span>
                    </div>
                    <span className="text-muted-foreground font-semibold" style={{ fontSize: 11 }}>VS</span>
                    <div className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                      <ClubLogoCell club={away} size={28} />
                      <span className="text-foreground font-medium text-center leading-tight" style={{ fontSize: 10 }}>{away?.name ?? m.awayTeamId}</span>
                    </div>
                  </div>
                  {(m.venue || grp) && (
                    <div className="text-muted-foreground text-center mt-2 pt-2 w-full" style={{ fontSize: 10, borderTop: "0.5px solid var(--border)" }}>
                      {[m.venue, grp ? "สาย " + grp.name : ""].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══ SECTION 5: สโมสรที่เข้าร่วม ═════════════════════════════════════ */}
      <section className="border-b border-border/50" style={{ padding: "28px 28px 24px" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted-foreground font-semibold uppercase" style={{ fontSize: 10, letterSpacing: "0.12em" }}>สโมสรที่เข้าร่วม</span>
          <Link href="/teams" className="font-semibold hover:opacity-70 transition-opacity" style={{ fontSize: 11, color: "#facc15" }}>ดูทั้งหมด →</Link>
        </div>
        {latestComp && (
          <div className="flex items-center gap-2 border-b border-border/50 pb-3" style={{ marginBottom: 14 }}>
            <span className="inline-block shrink-0" style={{ width: 6, height: 6, backgroundColor: "#facc15" }} />
            <span className="text-muted-foreground" style={{ fontSize: 11 }}>{latestComp.name}</span>
          </div>
        )}
        {clubsLoading ? (
          <div className="am-clubs-grid">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-[80px] w-full" />)}</div>
        ) : activeClubs.length === 0 ? (
          <p className="text-muted-foreground text-center py-6" style={{ fontSize: 12 }}>ยังไม่มีสโมสร</p>
        ) : (
          <div className="am-clubs-grid">
            {activeClubs.map((club) => {
              const zone = groupList.find((g) => g.teamIds.includes(club.id))?.name;
              return (
                <div key={club.id} className="border border-border/50 flex flex-col items-center hover:bg-muted/30 transition-colors cursor-default" style={{ padding: "14px 8px" }}>
                  <ClubLogoCell club={club} size={30} />
                  <span className="text-foreground text-center mt-1" style={{ fontSize: 9, lineHeight: 1.3 }}>{club.name}</span>
                  {zone && <span className="font-bold mt-1" style={{ fontSize: 9, color: "#facc15" }}>{zone}</span>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ══ SECTION 6: ทำเนียบแชมป์ ══════════════════════════════════════════ */}
      <section style={{ padding: "28px 28px 24px" }}>
        <div className="flex items-center justify-between mb-5">
          <span className="text-muted-foreground font-semibold uppercase" style={{ fontSize: 10, letterSpacing: "0.12em" }}>ทำเนียบแชมป์</span>
          <Link href="/champions" className="font-semibold hover:opacity-70 transition-opacity" style={{ fontSize: 11, color: "#facc15" }}>ดูทั้งหมด →</Link>
        </div>
        {championsLoading ? (
          <div className="am-champions-grid">{[1,2,3].map((i) => <Skeleton key={i} className="h-[120px] w-full" />)}</div>
        ) : championsData.length === 0 ? (
          <p className="text-muted-foreground text-center py-6" style={{ fontSize: 12 }}>ยังไม่มีข้อมูลแชมป์</p>
        ) : (
          <div className="am-champions-grid">
            {championsData.map((c, idx) => (
              <div key={c.id} className="border-r border-border/50 last:border-r-0" style={{ padding: 20 }}>
                <p className="text-muted-foreground uppercase" style={{ fontSize: 9, letterSpacing: "0.1em" }}>{c.year}</p>
                <p className="text-muted-foreground" style={{ fontSize: 10, marginBottom: 12 }}>{c.competitionName}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ fontSize: 14 }}>🏆</span>
                  <div>
                    <span className="font-bold uppercase" style={{ fontSize: 9, color: "#facc15", letterSpacing: "0.08em" }}>แชมป์</span>
                    <p className="text-foreground font-bold" style={{ fontSize: 13 }}>{c.champion || "–"}</p>
                  </div>
                </div>
                <div className="text-muted-foreground border-t border-border/50 pt-2" style={{ fontSize: 10 }}>
                  รองแชมป์: {c.runnerUp || "–"} · อันดับ 3: {c.thirdPlace || "–"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Responsive overrides via inline media query simulation ──────────── */}
      <style>{`
        @media (max-width: 1023px) {
          .hero-right { max-width: 100% !important; }
          .content-left, .content-right { border-right: none !important; }
          .am-upcoming-grid { grid-template-columns: 1fr !important; }
          .am-clubs-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .am-champions-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 767px) {
          .news-grid { grid-template-columns: 1fr !important; }
          .am-clubs-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        .am-upcoming-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        .am-clubs-grid { display: grid; grid-template-columns: repeat(8, 1fr); }
        .am-champions-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
      `}</style>
    </div>
  );
}
