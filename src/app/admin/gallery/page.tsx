"use client";

import { useState, useEffect } from "react";
import { DataService, GalleryAlbum } from "@/services/dataService";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Plus, Trash2, Image as ImageIcon, ExternalLink, Shield, X, Upload, Loader2 } from "lucide-react";
import { CldUploadWidget, CldImage } from "next-cloudinary";

import { swal } from "@/lib/swal";

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Album Form State
  const [newAlbum, setNewAlbum] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    isProtected: false,
    password: "",
  });
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = () => {
    setIsLoading(true);
    DataService.getGalleryAlbums().then(data => {
      setAlbums(data);
      setIsLoading(false);
    });
  };

  const handleDelete = async (id: string) => {
    const res = await swal.confirm("ยืนยันการลบอัลบั้มนี้?", "การดำเนินการนี้ไม่สามารถย้อนกลับได้");
    if (res.isConfirmed) {
      await DataService.deleteAlbum(id);
      setAlbums(albums.filter(a => a.albumId !== id));
      swal.success("ลบอัลบั้มสำเร็จ");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbum.title || !coverUrl) {
      swal.error("ข้อมูลไม่ครบถ้วน", "กรุณากรอกข้อมูลและอัปโหลดรูปหน้าปกให้ครบถ้วน");
      return;
    }

    setIsSaving(true);
    const success = await DataService.createAlbum({ 
      ...newAlbum, 
      coverUrl,
      photos: [] 
    });

    if (success) {
      setIsAdding(false);
      setNewAlbum({ title: "", date: new Date().toISOString().split("T")[0], isProtected: false, password: "" });
      setCoverUrl(null);
      loadAlbums();
      swal.success("สร้างอัลบั้มสำเร็จ");
    } else {
      swal.error("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้ในขณะนี้");
    }
    setIsSaving(false);
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">จัดการแกลเลอรี่</h1>
          <p className="text-sm text-muted-foreground">สร้าง ลบ และจัดการรูปภาพการแข่งขัน</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-black text-sm font-semibold rounded-sm hover:bg-yellow-300 transition-colors"
        >
          <Plus size={18} />
          สร้างอัลบั้มใหม่
        </button>
      </div>

      {!isFirebaseConfigured && (
        <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs rounded-sm">
          <strong>Mode Local:</strong> Firebase ยังไม่ได้ติดตั้ง ข้อมูลจะถูกดึงจากไฟล์ JSON
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-card border border-border/40 w-full max-w-xl p-8 rounded-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-semibold uppercase tracking-widest text-foreground">สร้างอัลบั้มใหม่</h2>
              <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">ชื่อการแข่งขัน / หัวข้อ</label>
                <input 
                  type="text" 
                  value={newAlbum.title}
                  onChange={e => setNewAlbum({...newAlbum, title: e.target.value})}
                  className="w-full bg-muted/30 border border-border/30 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  placeholder="เช่น Satun FC vs City Boys"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">วันที่</label>
                  <input 
                    type="date" 
                    value={newAlbum.date}
                    onChange={e => setNewAlbum({...newAlbum, date: e.target.value})}
                    className="w-full bg-muted/30 border border-border/30 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">รหัสผ่าน (ถ้ามี)</label>
                  <input 
                    type="text" 
                    value={newAlbum.password}
                    onChange={e => setNewAlbum({...newAlbum, password: e.target.value, isProtected: !!e.target.value})}
                    className="w-full bg-muted/30 border border-border/30 rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-primary"
                    placeholder="ปล่อยว่างหากไม่มี"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">รูปหน้าปก (Cloudinary)</label>
                <CldUploadWidget
                  signatureEndpoint="/api/sign-cloudinary-params"
                  onSuccess={(result: any) => {
                    setCoverUrl(result.info.secure_url);
                  }}
                  options={{
                    maxFiles: 1,
                    folder: "albums",
                    clientAllowedFormats: ["jpg", "png", "webp", "avif"],
                  }}
                >
                  {({ open }) => (
                    <div 
                      onClick={() => open()}
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border/30 rounded-sm cursor-pointer hover:border-primary/50 transition-colors bg-muted/10 overflow-hidden relative"
                    >
                      {coverUrl ? (
                        <CldImage src={coverUrl} alt="Preview" fill className="object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload size={24} className="text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground text-center px-4">คลิกเพื่ออัปโหลดรูปหน้าปกแบบ Signed Upload</span>
                        </div>
                      )}
                    </div>
                  )}
                </CldUploadWidget>
              </div>

              <button 
                type="submit" 
                disabled={isSaving || !coverUrl}
                className="w-full py-4 bg-primary text-black font-bold text-sm rounded-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    กำลังบันทึกอัลบั้ม...
                  </>
                ) : (
                  "สร้างอัลบั้มทันที"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-card h-48 border border-border/40 rounded-sm animate-pulse" />
          ))
        ) : (
          albums.map(album => (
            <div key={album.albumId} className="group bg-card border border-border/40 rounded-sm overflow-hidden flex flex-col">
              {/* Cover Preview */}
              <div className="aspect-video relative overflow-hidden bg-muted">
                {album.coverUrl.includes("cloudinary") ? (
                  <CldImage 
                    src={album.coverUrl} 
                    alt={album.title}
                    width={600}
                    height={340}
                    crop="fill"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <img 
                    src={album.coverUrl} 
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {album.isProtected && (
                  <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm p-1.5 rounded-sm">
                    <Shield size={12} className="text-primary" />
                  </div>
                )}
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
        <p className="text-sm text-muted-foreground italic">
          // Cloudinary Media Integration Active //
        </p>
      </div>
    </div>
  );
}


