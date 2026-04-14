"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DataService, GalleryAlbum } from "@/services/dataService";
import { CldImage } from "next-cloudinary";

export default function WorksSection() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getGalleryAlbums().then((res) => {
      setAlbums(res || []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="py-24 text-center text-muted-foreground text-sm animate-pulse">
      กำลังดึงข้อมูลผลงาน...
    </div>
  );

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

        {/* Grid — show empty state if no albums */}
        {albums.length === 0 ? (
          <div className="py-20 border border-dashed border-border/60 rounded-sm text-center">
            <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลผลงานในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {albums.slice(0, 6).map((album, i) => (
              <Link
                key={album.albumId}
                href={`/gallery/${album.albumId}`}
                className="group relative overflow-hidden rounded-sm bg-muted block"
                style={{
                  // Make the first item (index 0) span 2 columns on md+ for a featured look
                  ...(i === 0 ? { gridColumn: "span 2 / span 2" } : {}),
                }}
              >
                {/* Image */}
                <div
                  className={`relative w-full overflow-hidden ${
                    i === 0 ? "aspect-[16/9]" : "aspect-square"
                  }`}
                >
                  {album.coverUrl.includes("cloudinary") ? (
                    <CldImage
                      src={album.coverUrl}
                      alt={album.title}
                      width={i === 0 ? 1200 : 800}
                      height={i === 0 ? 675 : 800}
                      crop="fill"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-[1.03] transition-transform duration-500"
                      style={{ backgroundImage: `url('${album.coverUrl}')` }}
                    />
                  )}
                </div>

                {/* Hover overlay with title */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-sm font-medium">{album.title}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
