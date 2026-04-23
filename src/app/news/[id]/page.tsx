"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import type { News } from "@/types/news";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Newspaper, Play } from "lucide-react";

function VideoEmbed({ url }: { url: string }) {
  if (!url) return null;

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let videoId = "";
    try {
      if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
      } else {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get("v") || "";
      }
    } catch (e) {
      // ignore parsing errors
    }

    if (videoId) {
      return (
        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-border/50 bg-black my-8">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
            allowFullScreen
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      );
    }
  } else if (url.includes("facebook.com") || url.includes("fb.watch")) {
    const encodedUrl = encodeURIComponent(url);
    return (
      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-border/50 bg-black my-8">
        <iframe
          className="w-full h-full"
          src={`https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false`}
          scrolling="no"
          allowFullScreen
          title="Facebook video player"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        ></iframe>
      </div>
    );
  }

  // Fallback link if not YT or FB
  return (
    <div className="p-6 bg-muted/30 border border-border/50 text-center rounded-xl my-8">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 font-bold text-[#facc15] hover:text-[#eab308] transition-colors"
      >
        <Play size={18} /> คลิกเพื่อรับชมวิดีโอ
      </a>
    </div>
  );
}

// In Next.js 15, params is a Promise
export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [news, setNews] = useState<News | null>(null);
  const [relatedNews, setRelatedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const docRef = doc(db, "news", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        const newsData = {
          id: docSnap.id,
          ...data,
          publishedAt: data.publishedAt?.toDate
            ? data.publishedAt.toDate().toISOString()
            : data.publishedAt,
        } as News;

        // Only show published news
        if (newsData.status !== "published") {
          setLoading(false);
          return;
        }

        setNews(newsData);

        // Fetch related news (same category, max 4 docs to filter out current one)
        const q = query(
          collection(db, "news"),
          where("status", "==", "published"),
          where("category", "==", newsData.category),
          orderBy("publishedAt", "desc"),
          limit(4)
        );

        const relSnap = await getDocs(q);
        const relData: News[] = [];
        
        relSnap.docs.forEach((d) => {
          if (d.id !== id && relData.length < 3) { // keep max 3
            const rData = d.data();
            relData.push({
              id: d.id,
              ...rData,
              publishedAt: rData.publishedAt?.toDate
                ? rData.publishedAt.toDate().toISOString()
                : rData.publishedAt,
            } as News);
          }
        });

        setRelatedNews(relData);
      } catch (error) {
        console.error("Error fetching news detail:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-12 max-w-4xl mx-auto space-y-8">
        <Skeleton className="w-full aspect-[21/9] rounded-2xl" />
        <Skeleton className="h-12 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4 pt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[95%]" />
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="container py-32 text-center flex flex-col items-center gap-6">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
          <Newspaper size={40} className="text-muted-foreground/50" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">ไม่พบเนื้อหาที่คุณค้นหา</h1>
          <p className="text-muted-foreground mt-2">
            เนื้อหานี้อาจถูกลบหรือไม่ได้เผยแพร่แล้ว
          </p>
        </div>
        <Button onClick={() => router.push("/news")} className="mt-4 font-bold">
          <ArrowLeft size={16} className="mr-2" /> กลับไปหน้าข่าวสาร
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Edge to Edge Cover Image */}
      <div className="w-full h-[40vh] md:h-[60vh] relative bg-muted flex items-center justify-center overflow-hidden">
        {news.coverImage ? (
          <>
            <img
              src={news.coverImage}
              alt={news.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient Overlay for better readability of text if we put any */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </>
        ) : (
          <Newspaper size={64} className="text-muted-foreground/30" />
        )}
      </div>

      <div className="container max-w-4xl mx-auto -mt-32 relative z-10 px-4 md:px-8">
        <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-12 shadow-xl backdrop-blur-md">
          {/* Back Button */}
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} /> ย้อนกลับ
          </Link>

          {/* Meta Data */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Badge
              className={`border-none px-3 py-1 text-xs font-bold ${
                news.category === "highlight"
                  ? "bg-purple-600 text-white hover:bg-purple-600"
                  : "bg-[#facc15] text-black hover:bg-[#facc15]"
              }`}
            >
              {news.category === "highlight" ? "HIGHLIGHT" : "NEWS"}
            </Badge>

            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Calendar size={14} />
              <span>
                {new Date(news.publishedAt as string).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <User size={14} />
              <span>{news.authorName}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-10 text-foreground">
            {news.title}
          </h1>

          {/* Optional Video Embed */}
          {news.videoUrl && <VideoEmbed url={news.videoUrl} />}

          {/* Content Body */}
          <div className="prose prose-zinc dark:prose-invert max-w-none text-base md:text-lg leading-relaxed whitespace-pre-wrap text-foreground/90 font-light">
            {news.content}
          </div>
        </div>
      </div>

      {/* Related News Section */}
      {relatedNews.length > 0 && (
        <div className="container max-w-5xl mx-auto mt-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-[#facc15] rounded-full" />
            <h2 className="text-2xl font-black uppercase tracking-wider">
              {news.category === "highlight" ? "More Highlights" : "Related News"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedNews.map((item) => (
              <Link
                href={`/news/${item.id}`}
                key={item.id}
                className="group flex flex-col gap-4 focus-visible:outline-none"
              >
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted border border-border/20">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper size={32} className="text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-bold text-xs uppercase tracking-widest border border-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
                      อ่านต่อ
                    </span>
                  </div>
                </div>
                <div className="px-1">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    {new Date(item.publishedAt as string).toLocaleDateString("th-TH")}
                  </p>
                  <h3 className="font-bold text-base leading-snug group-hover:text-[#facc15] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
