import Link from "next/link";
import { ArrowRight, Play, FileText, Image as ImageIcon } from "lucide-react";

export const metadata = { title: "ข่าวสาร & ไฮไลต์ | AM Tournament" };

const newsItems = [
  {
    id: "news_001",
    type: "Highlight",
    title: "ไฮไลต์ทำประตูสุดมันส์ สัปดาห์แรกของการแข่งขัน",
    date: "18 พ.ค. 2026",
    image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=800",
    excerpt: "รวมทุกวินาทีสำคัญ ช็อตมหัศจรรย์และการทำประตูสวยงามจากสัปดาห์ที่ 1",
    icon: Play
  },
  {
    id: "news_002",
    type: "News",
    title: "Satun United ทีมประวัติศาสตร์ คว้าชัยนัดเปิดสนามได้อย่างสวยงาม",
    date: "15 พ.ค. 2026",
    image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?q=80&w=800",
    excerpt: "รายงานสดจากขอบสนาม Satun United คว้าคะแนนสำคัญไปได้อย่างยอดเยี่ยม",
    icon: FileText
  },
  {
    id: "news_003",
    type: "Announcement",
    title: "อัปเดตกฎกติกาใหม่ ฤดูกาล 2026 ที่ทุกทีมต้องรู้",
    date: "10 พ.ค. 2026",
    image: "https://images.unsplash.com/photo-1518605363461-4ea6718d0526?q=80&w=800",
    excerpt: "การเปลี่ยนแปลงกฎการแข่งขัน การเปลี่ยนตัวผู้เล่น และระบบฟาวล์ในฤดูกาลนี้",
    icon: FileText
  },
  {
    id: "news_004",
    type: "Gallery",
    title: "รวมมิตรภาพนอกสนาม สีสันกองเชียร์",
    date: "08 พ.ค. 2026",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800",
    excerpt: "บรรยากาศกองเชียร์และความน่ารักของแฟนบอลแต่ละทีมประจำสัปดาห์",
    icon: ImageIcon
  }
];

export default function NewsPage() {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {newsItems.map((news) => {
              const Icon = news.icon;
              return (
                <article key={news.id} className="group cursor-pointer">
                  {/* Image wrapper */}
                  <div className="relative aspect-[16/9] overflow-hidden rounded-sm bg-muted mb-6">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.03] transition-transform duration-700"
                      style={{ backgroundImage: `url('${news.image}')` }}
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
                    <p className="text-[11px] text-muted-foreground mb-3">{news.date}</p>
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
        </div>
      </div>
      
      {/* Load More Button mock */}
      <div className="flex justify-center pb-20">
        <button className="px-8 py-3 text-sm font-semibold border border-border text-foreground rounded-sm hover:border-foreground/50 transition-colors">
          ดูข่าวสารเพิ่มเติม
        </button>
      </div>
    </div>
  );
}
