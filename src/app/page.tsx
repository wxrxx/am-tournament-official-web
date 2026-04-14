import Link from "next/link";
import { DataService } from "@/services/dataService";
import HeroSection from "@/components/HeroSection";
import WorksSection from "@/components/WorksSection";

export default async function Home() {
  const albums = await DataService.getGalleryAlbums();
  const allMatches = await DataService.getMatches();
  const upcomingMatches = allMatches.filter(m => m.status === "upcoming").slice(0, 4);

  return (
    <div>
      {/* ─── Hero ─── */}
      <HeroSection />

      {/* ─── Works / Portfolio ─── */}
      <WorksSection />

      {/* ─── Upcoming Matches ─── */}
      <section className="py-24 px-6 bg-card border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-xl font-semibold text-foreground">นัดแข่งขันที่จะมา</h2>
            <Link href="/schedule" className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide">
              ตารางทั้งหมด →
            </Link>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="py-12 border border-dashed border-border/60 rounded-sm text-center">
              <p className="text-sm text-muted-foreground">ยังไม่มีกำหนดการแข่งขันในขณะนี้</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {upcomingMatches.map((m, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto_1fr] items-center py-5 gap-4 hover:bg-muted/20 px-4 -mx-4 transition-colors rounded-sm"
                >
                  {/* Home */}
                  <p className="text-sm font-medium text-foreground text-right">{m.home || m.teamA}</p>

                  {/* Center: date + time */}
                  <div className="text-center px-6">
                    <p className="text-[11px] text-muted-foreground mb-0.5">{m.date}</p>
                    <p className="text-sm font-bold text-foreground tabular-nums">{m.time || "TBD"}</p>
                  </div>

                  {/* Away */}
                  <p className="text-sm font-medium text-foreground">{m.away || m.teamB}</p>
                </div>
              ))}
            </div>
          )}
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
