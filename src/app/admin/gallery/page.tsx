"use client";

import { useState, useEffect } from "react";
import { DataService, GalleryAlbum } from "@/services/dataService";
import { Plus, Trash2, Image as ImageIcon, ExternalLink, Shield } from "lucide-react";

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    DataService.getGalleryAlbums().then(data => {
      setAlbums(data);
      setIsLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("ยืนยันการลบอัลบั้มนี้?")) {
      await DataService.deleteAlbum(id);
      setAlbums(albums.filter(a => a.albumId !== id));
    }
  };

  const handleCreate = () => {
    alert("ระบบจำลอง: ระบบจะแสดงฟอร์มสำหรับอัปโหลดรูปภาพและสร้างอัลบั้มใหม่\n(TODO: เชื่อมต่อ Supabase Storage และ DB)");
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">จัดการแกลเลอรี่</h1>
          <p className="text-sm text-muted-foreground">สร้าง ลบ และจัดการรูปภาพการแข่งขัน</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-black text-sm font-semibold rounded-sm hover:bg-yellow-300 transition-colors"
        >
          <Plus size={18} />
          สร้างอัลบั้มใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-card h-48 border border-border/40 rounded-sm animate-pulse" />
          ))
        ) : (
          albums.map(album => (
            <div key={album.albumId} className="group bg-card border border-border/40 rounded-sm overflow-hidden flex flex-col">
              {/* Cover Preview (Mock) */}
              <div className="aspect-video relative overflow-hidden bg-muted">
                <img 
                  src={album.coverUrl} 
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {album.isProtected && (
                  <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm p-1.5 rounded-sm">
                    <Shield size={12} className="text-primary" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
                    <ImageIcon size={18} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2 font-medium">
                  {album.date}
                </p>
                <h3 className="text-sm font-semibold text-foreground mb-4 line-clamp-1">{album.title}</h3>
                
                <div className="mt-auto flex items-center justify-between border-t border-border/30 pt-4">
                  <a href={`/gallery/${album.albumId}`} target="_blank" className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors">
                    <ExternalLink size={12} />
                    ดูหน้าเว็บทบทวน
                  </a>
                  <button 
                    onClick={() => handleDelete(album.albumId)}
                    className="text-[11px] text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={12} />
                    ลบอัลบั้ม
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-16 p-8 border border-dashed border-border rounded-lg bg-muted/20 text-center">
        <p className="text-sm text-muted-foreground">
          // TODO: Future Implementation<br/>
          <span className="text-[11px] block mt-2">
            - ระบบ Multi-file Selection สำหรับเครื่องมืออัปโหลด<br/>
            - การสร้าง Watermark อัตโนมัติด้วย Canvas / Sharp บน Server<br/>
            - การสุ่มสร้างรหัสผ่านอัลบั้ม
          </span>
        </p>
      </div>
    </div>
  );
}
