import Link from "next/link";
import { DataService } from "@/services/dataService";
import HeroSection from "@/components/HeroSection";
import WorksSection from "@/components/WorksSection";

const upcomingMatches = [
  { date: "เสาร์ 24 พ.ค.", time: "14:00", home: "Satun FC", away: "City Boys" },
  { date: "เสาร์ 24 พ.ค.", time: "16:00", home: "Ratchada UTD", away: "North Kings" },
  { date: "อาทิตย์ 25 พ.ค.", time: "09:00", home: "Lipe Marines", away: "Mueang Thong FC" },
  { date: "อาทิตย์ 25 พ.ค.", time: "11:00", home: "Kanab FC", away: "Southern Stars" },
];

const latestHighlights = [
  {
    id: "1",
    title: "Satun United คว้าชัยนัดเปิดสนาม",
    date: "15 พ.ค. 2026",
    image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=800",
  },
  {
    id: "2",
    title: "กฎกติกาใหม่ ฤดูกาล 2026",
    date: "10 พ.ค. 2026",
    image: "https://images.unsplash.com/photo-1518605363461-4ea6718d0526?q=80&w=800",
  },
  {
    id: "3",
    title: "ประตูยอดเยี่ยมประจำสัปดาห์แรก",
    date: "18 พ.ค. 2026",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800",
  },
];

export default async function Home() {
  const albums = await DataService.getGalleryAlbums();

  return (
    <div>
      {/* ─── Hero ─── */}
      <HeroSection />

      {/* ─── Works / Portfolio ─── */}
      <WorksSection />

      {/* ─── Latest Highlights ─── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-xl font-semibold text-foreground">ไฮไลต์ล่าสุด</h2>
            <Link href="/news" className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide">
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestHighlights.map((n) => (
              <article key={n.id} className="group cursor-pointer">
                <div className="aspect-[16/10] overflow-hidden rounded-sm bg-muted mb-5">
                  <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-[1.03] transition-transform duration-500"
                    style={{ backgroundImage: `url('${n.image}')` }}
                  />
                </div>
                <p className="text-[12px] text-muted-foreground mb-2">{n.date}</p>
                <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                  {n.title}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Upcoming Matches ─── */}
      <section className="py-24 px-6 bg-card border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-xl font-semibold text-foreground">นัดแข่งขันที่จะมา</h2>
            <Link href="/schedule" className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide">
              ตารางทั้งหมด →
            </Link>
          </div>

          <div className="divide-y divide-border/50">
            {upcomingMatches.map((m, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_1fr] items-center py-5 gap-4 hover:bg-muted/20 px-4 -mx-4 transition-colors rounded-sm"
              >
                {/* Home */}
                <p className="text-sm font-medium text-foreground text-right">{m.home}</p>

                {/* Center: date + time */}
                <div className="text-center px-6">
                  <p className="text-[11px] text-muted-foreground mb-0.5">{m.date}</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">{m.time}</p>
                </div>

                {/* Away */}
                <p className="text-sm font-medium text-foreground">{m.away}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Gallery ─── */}
      {albums.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-xl font-semibold text-foreground">แกลเลอรี่เด่น</h2>
              <Link href="/gallery" className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide">
                ดูทั้งหมด →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {albums.slice(0, 4).map((album) => (
                <Link
                  key={album.albumId}
                  href={`/gallery/${album.albumId}`}
                  className="group relative aspect-square overflow-hidden rounded-sm bg-muted block"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.04] transition-transform duration-500"
                    style={{ backgroundImage: `url('${album.coverUrl}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-xs font-medium line-clamp-1">{album.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA Banner ─── */}
      <section className="py-20 px-6 bg-card border-t border-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">บันทึกทุกช็อตสำคัญของทีม</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            ซื้อภาพถ่ายความละเอียดสูง ไร้ลายน้ำ หรือจองช่างภาพมืออาชีพสำหรับทีมของคุณตลอดทั้งฤดูกาล
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/shop" className="px-6 py-3 bg-foreground text-background text-sm font-semibold rounded-sm hover:opacity-85 transition-opacity">
              สั่งซื้อสินค้า
            </Link>
            <Link href="/team-package" className="px-6 py-3 border border-border text-foreground text-sm font-semibold rounded-sm hover:border-foreground/60 transition-colors">
              จองช่างภาพ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
