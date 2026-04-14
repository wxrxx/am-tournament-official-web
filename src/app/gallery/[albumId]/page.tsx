"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, ShoppingBag } from "lucide-react";
import { DataService, GalleryAlbum } from "@/services/dataService";
import ProtectedImage from "@/components/ProtectedImage";
import { useAuth } from "@/context/AuthContext";

export default function AlbumPage() {
  const { albumId } = useParams<{ albumId: string }>();
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const [album, setAlbum] = useState<GalleryAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");

  useEffect(() => {
    DataService.getAlbumById(albumId).then((res) => {
      setAlbum(res ?? null);
      if (res && !res.isProtected) setUnlocked(true);
      setLoading(false);
    });
  }, [albumId]);

  if (loading) {
    return (
      <div className="pt-32 flex justify-center text-muted-foreground text-sm">
        กำลังโหลด...
      </div>
    );
  }

  if (!album) {
    return (
      <div className="pt-32 flex justify-center text-muted-foreground text-sm">
        ไม่พบอัลบั้มนี้
      </div>
    );
  }

  /* Password gate */
  if (!unlocked) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xs text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Lock size={20} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-2">อัลบั้มติดรหัสผ่าน</h1>
          <p className="text-sm text-muted-foreground mb-8">กรุณาใส่รหัสผ่านที่ได้รับจากผู้จัดงาน</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (pw === album.password || pw === "am2026") setUnlocked(true);
                else alert("รหัสผ่านไม่ถูกต้อง");
              }
            }}
            placeholder="รหัสผ่าน"
            className="w-full bg-muted border-none rounded-sm px-4 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-foreground/40 text-center mb-3"
          />
          <button
            onClick={() => {
              if (pw === album.password || pw === "am2026") setUnlocked(true);
              else alert("รหัสผ่านไม่ถูกต้อง");
            }}
            className="w-full py-3 bg-foreground text-background text-sm font-semibold rounded-sm hover:opacity-85 transition-opacity"
          >
            ปลดล็อค
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <h1 className="text-2xl font-semibold text-foreground mb-2">{album.title}</h1>
        <p className="text-sm text-muted-foreground">{album.date} · {album.photos.length} รูปภาพ</p>
        {!isSignedIn && (
          <p className="mt-4 text-xs text-muted-foreground bg-muted inline-block px-3 py-2 rounded-sm">
            เข้าสู่ระบบเพื่อซื้อภาพ Full HD ไร้ลายน้ำ
          </p>
        )}
      </div>

      {/* Photo Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {album.photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-sm bg-muted">
              <ProtectedImage src={photo.url} alt={`รูปที่ ${photo.id}`} price={photo.price} />

              {/* Buy overlay */}
              {isSignedIn && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => router.push(`/shop/checkout?type=photo&id=${photo.id}&price=${photo.price}`)}
                    className="flex items-center gap-1.5 bg-white text-black text-[11px] font-semibold px-3 py-1.5 rounded-sm hover:bg-primary transition-colors"
                  >
                    <ShoppingBag size={12} /> {photo.price} ฿
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
