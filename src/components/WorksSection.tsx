import Link from "next/link";

// ─── Edit this array to add/remove portfolio photos ───────────────────────
// Or replace with a fetch from /data/works.json for fully data-driven updates
const WORKS = [
  {
    id: "work_001",
    title: "แมตช์ฤดูเปิดสนาม 2026",
    image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=800",
    albumId: "album_001",
  },
  {
    id: "work_002",
    title: "Satun FC vs City Boys",
    image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?q=80&w=800",
    albumId: "album_001",
  },
  {
    id: "work_003",
    title: "ช็อตเด็ดจากขอบสนาม",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800",
    albumId: "album_001",
  },
  {
    id: "work_004",
    title: "บรรยากาศการแข่งขัน",
    image: "https://images.unsplash.com/photo-1518605363461-4ea6718d0526?q=80&w=800",
    albumId: "album_001",
  },
  {
    id: "work_005",
    title: "ช่วงเวลาแห่งชัยชนะ",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=800",
    albumId: "album_001",
  },
  {
    id: "work_006",
    title: "Portrait นักเตะ",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=800",
    albumId: "album_001",
  },
];

export default function WorksSection() {
  return (
    <section className="py-24 px-6 border-t border-border/40">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.35em] uppercase text-primary mb-3">
              Portfolio
            </p>
            <h2 className="text-xl font-semibold text-foreground">ผลงานของเรา</h2>
          </div>
          <Link
            href="/gallery"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide"
          >
            ดูทั้งหมด →
          </Link>
        </div>

        {/* Grid — change grid-cols-* to adjust columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {WORKS.map((work, i) => (
            <Link
              key={work.id}
              href={`/gallery/${work.albumId}`}
              className="group relative overflow-hidden rounded-sm bg-muted block"
              style={{
                // Make the first item (index 0) span 2 columns on md+ for a featured look
                ...(i === 0 ? { gridColumn: "span 2 / span 2" } : {}),
              }}
            >
              {/* Image */}
              <div
                className={`w-full bg-cover bg-center group-hover:scale-[1.03] transition-transform duration-500 ${
                  i === 0 ? "aspect-[16/9]" : "aspect-square"
                }`}
                style={{ backgroundImage: `url('${work.image}')` }}
              />

              {/* Hover overlay with title */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white text-sm font-medium">{work.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
