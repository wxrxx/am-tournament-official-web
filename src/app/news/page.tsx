"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Play, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { DataService, News } from "@/services/dataService";

const iconMap: Record<string, any> = {
  "Highlight": Play,
  "News": FileText,
  "Announcement": FileText,
  "Gallery": ImageIcon
};

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setIsLoading(true);
    const data = await DataService.getNews(false); // Only published
    setNewsItems(data);
    setIsLoading(false);
  };

  return (
    <div className="pt-16 min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          News & Updates
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-4">ข่าวสารและไฮไลต์</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          อัปเดตทุกความเคลื่อนไหวจากขอบสนาม คลิปไฮไลต์ และสกู๊ปพิเศษสำหรับแฟนโดยเฉพาะ
        </p>
      </div>

      <div className="border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
               <Loader2 className="animate-spin text-primary mb-4" size={32} />
               <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">กำลังโหลดข่าวสาร...</p>
            </div>
          ) : newsItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              {newsItems.map((news) => {
                const Icon = iconMap[news.type] || FileText;
                return (
                  <article key={news.id} className="group cursor-pointer">
                    {/* Image wrapper */}
                    <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-muted mb-6">
                      <div
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.03] transition-transform duration-700"
                        style={{ backgroundImage: `url('${news.imageUrl}')` }}
                      />
                      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-sm flex items-center gap-2">
                        <Icon size={12} className="text-primary" />
                        <span className="text-[10px] font-semibold tracking-wider text-foreground uppercase">
                          {news.type}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="max-w-md">
                      <p className="text-[11px] text-muted-foreground mb-3">
                        {new Date(news.publishedAt).toLocaleDateString('th-TH', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                      <h3 className="text-xl font-medium text-foreground leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {news.excerpt}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-border/40 rounded-sm">
               <p className="text-sm text-muted-foreground italic font-medium">ยังไม่มีข่าวสารในขณะนี้</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Load More Button */}
      {newsItems.length > 0 && !isLoading && (
        <div className="flex justify-center pb-20">
          <button className="px-8 py-3 text-sm font-semibold border border-border text-foreground rounded-sm hover:border-foreground/50 transition-colors uppercase tracking-widest text-[11px]">
            ดูข่าวสารทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
}

