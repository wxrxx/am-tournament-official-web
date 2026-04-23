"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import type { News } from "@/types/news";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Play, Loader2, Calendar } from "lucide-react";

const ITEMS_PER_PAGE = 12;

export default function PublicNewsPage() {
  const [activeTab, setActiveTab] = useState<"news" | "highlight">("news");
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchNews = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) {
      setLoading(true);
      setNews([]);
      setHasMore(true);
      setLastDoc(null);
    } else {
      setLoadingMore(true);
    }

    try {
      let q = query(
        collection(db, "news"),
        where("status", "==", "published"),
        where("category", "==", activeTab),
        orderBy("publishedAt", "desc"),
        limit(ITEMS_PER_PAGE)
      );

      if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snap = await getDocs(q);
      
      const newDocs = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate().toISOString() : data.publishedAt,
        } as News;
      });

      if (isLoadMore) {
        setNews((prev) => [...prev, ...newDocs]);
      } else {
        setNews(newDocs);
      }

      if (snap.docs.length > 0) {
        setLastDoc(snap.docs[snap.docs.length - 1]);
      }

      if (snap.docs.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, lastDoc]); // eslint-disable-line react-hooks/exhaustive-deps

  // We want to fetch news when activeTab changes, so we don't include lastDoc in this effect's deps
  useEffect(() => {
    fetchNews(false);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-screen-xl mx-auto px-8 pt-28 pb-20 space-y-12 min-h-[calc(100vh-200px)]">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
            News & <span className="text-[#facc15]">Highlights</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            ติดตามข่าวสารและชมคลิปไฮไลต์การแข่งขันล่าสุด
          </p>
        </div>

        <div className="flex bg-muted/50 p-1 rounded-xl w-full md:w-64 shrink-0">
          <button
            onClick={() => setActiveTab("news")}
            className={`flex-1 md:w-32 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "news"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Newspaper size={18} /> ข่าวสาร
          </button>
          <button
            onClick={() => setActiveTab("highlight")}
            className={`flex-1 md:w-32 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "highlight"
                ? "bg-background text-[#facc15] shadow-sm"
                : "text-muted-foreground hover:text-[#facc15] hover:bg-muted"
            }`}
          >
            <Play size={18} /> ไฮไลต์
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="w-full aspect-[16/9] rounded-2xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/4" />
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center">
            {activeTab === "news" ? (
              <Newspaper size={32} className="text-muted-foreground/50" />
            ) : (
              <Play size={32} className="text-muted-foreground/50" />
            )}
          </div>
          <div>
            <p className="font-bold text-2xl text-foreground">
              ยังไม่มี{activeTab === "news" ? "ข่าวสาร" : "ไฮไลต์"}ในขณะนี้
            </p>
            <p className="text-muted-foreground mt-2">โปรดติดตามอัปเดตเพิ่มเติมเร็วๆ นี้</p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {news.map((item) => (
              <Link
                href={`/news/${item.id}`}
                key={item.id}
                className="group flex flex-col gap-5 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15] rounded-2xl"
              >
                {/* 16:9 Image Container */}
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-muted border border-border/20 shadow-sm transition-transform duration-500 group-hover:shadow-lg group-hover:-translate-y-1">
                  <Badge 
                    className={`absolute top-4 left-4 z-20 border-none px-3 py-1 text-xs font-bold ${
                      item.category === 'highlight' 
                        ? 'bg-purple-600 text-white hover:bg-purple-600' 
                        : 'bg-[#facc15] text-black hover:bg-[#facc15]'
                    }`}
                  >
                    {item.category === "highlight" ? "HIGHLIGHT" : "NEWS"}
                  </Badge>

                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper size={48} className="text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      item.category === 'highlight' ? 'bg-purple-600 text-white' : 'bg-[#facc15] text-black'
                    } transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300`}>
                      {item.category === "highlight" ? <Play size={24} className="ml-1" /> : <Newspaper size={24} />}
                    </div>
                    <span className="text-white font-bold tracking-widest text-sm uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      อ่านต่อ
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2 px-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Calendar size={14} />
                    <span>{new Date(item.publishedAt as string).toLocaleDateString("th-TH", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <h3 className="text-2xl font-bold leading-tight group-hover:text-[#facc15] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => fetchNews(true)}
                disabled={loadingMore}
                className="w-full md:w-auto min-w-[200px] border-border hover:bg-muted font-bold tracking-wider"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    กำลังโหลด...
                  </>
                ) : (
                  "โหลดเพิ่มเติม"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
