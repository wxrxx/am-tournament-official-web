import Link from "next/link";
import { Lock } from "lucide-react";
import { DataService } from "@/services/dataService";

export const metadata = { title: "แกลเลอรี่รูป | AM Tournament" };

export default async function GalleryPage() {
  const albums = await DataService.getGalleryAlbums();

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <h1 className="text-2xl font-semibold text-foreground mb-3">แกลเลอรี่รูป</h1>
        <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
          ภาพถ่ายความละเอียดสูงจากทุกนัดแข่งขัน บันทึกโดยช่างภาพกีฬามืออาชีพ
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <Link
              key={album.albumId}
              href={`/gallery/${album.albumId}`}
              className="group block"
            >
              {/* Image */}
              <div className="aspect-[4/3] relative overflow-hidden rounded-sm bg-muted mb-4">
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
                {album.isProtected && (
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-[11px] font-medium px-2.5 py-1 rounded-sm flex items-center gap-1.5">
                    <Lock size={10} className="text-primary" /> มีรหัสผ่าน
                  </div>
                )}
              </div>
              {/* Caption */}
              <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors mb-1 leading-snug">
                {album.title}
              </h3>
              <p className="text-[12px] text-muted-foreground">{album.date} · {album.photos.length} รูป</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
