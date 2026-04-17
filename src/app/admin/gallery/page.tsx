"use client";

import { useState, useEffect } from "react";
import { DataService, GalleryAlbum } from "@/services/dataService";
import { isFirebaseConfigured } from "@/lib/firebase";
import { Plus, Trash2, Image as ImageIcon, ExternalLink, Shield, Upload, Loader2 } from "lucide-react";
import { CldUploadWidget, CldImage } from "next-cloudinary";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    const success = await DataService.deleteAlbum(id);
    if (success) {
      setAlbums(albums.filter(a => a.albumId !== id));
      toast.success("ลบอัลบั้มเรียบร้อยแล้ว");
    } else {
      toast.error("เกิดข้อผิดพลาดในการลบอัลบั้ม");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbum.title || !coverUrl) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
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
      toast.success("สร้างอัลบั้มใหม่สำเร็จ");
    } else {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">จัดการแกลเลอรี่</h1>
          <p className="text-muted-foreground">สร้าง ลบ และจัดการอัลบั้มรูปภาพการแข่งขันระดับพรีเมียม</p>
        </div>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          {/* DialogTrigger styled directly with buttonVariants — Base UI has no asChild */}
          <DialogTrigger
            className={cn(
              buttonVariants({ size: "sm" }),
              "gap-2 font-bold uppercase tracking-widest text-[11px] rounded-sm"
            )}
          >
            <Plus size={16} />
            สร้างอัลบั้มใหม่
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="uppercase tracking-widest text-sm font-bold">สร้างอัลบั้มใหม่</DialogTitle>
              <DialogDescription>
                ตั้งค่าอัลบั้มรูปภาพและอัปโหลดหน้าปกเพื่อแสดงผลบนหน้าเว็บ
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">ชื่อการแข่งขัน / หัวข้อ</Label>
                <Input
                  id="title"
                  value={newAlbum.title}
                  onChange={e => setNewAlbum({...newAlbum, title: e.target.value})}
                  placeholder="เช่น Satun FC vs City Boys"
                  className="rounded-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">วันที่</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAlbum.date}
                    onChange={e => setNewAlbum({...newAlbum, date: e.target.value})}
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">รหัสผ่าน (ถ้ามี)</Label>
                  <Input
                    id="password"
                    type="text"
                    value={newAlbum.password}
                    onChange={e => setNewAlbum({...newAlbum, password: e.target.value, isProtected: !!e.target.value})}
                    placeholder="ปล่อยว่างหากไม่มี"
                    className="rounded-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">รูปหน้าปก (Cloudinary)</Label>
                <CldUploadWidget
                  signatureEndpoint="/api/sign-cloudinary-params"
                  onSuccess={(result: any) => { setCoverUrl(result.info.secure_url); }}
                  onClose={() => {
                    document.body.style.overflow = "auto";
                    document.documentElement.style.overflow = "auto";
                  }}
                  options={{ maxFiles: 1, folder: "albums", clientAllowedFormats: ["jpg", "png", "webp", "avif"] }}
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
                          <span className="text-[11px] text-muted-foreground text-center px-4">คลิกเพื่ออัปโหลดรูปหน้าปก (Signed)</span>
                        </div>
                      )}
                    </div>
                  )}
                </CldUploadWidget>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSaving || !coverUrl} className="w-full font-bold uppercase tracking-widest text-[11px]">
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : "บันทึกอัลบั้มทันที"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!isFirebaseConfigured && (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 py-1 px-4">
          <strong>Mode Local:</strong> โปรดตรวจสอบการตั้งค่า Firebase
        </Badge>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-sm" />
          ))
        ) : albums.length > 0 ? (
          albums.map(album => (
            <Card key={album.albumId} className="group overflow-hidden border-border/40 shadow-sm flex flex-col">
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
                <div className="absolute top-3 left-3 flex gap-2">
                  {album.isProtected && (
                    <Badge className="bg-background/80 backdrop-blur-sm px-1.5 h-6 text-primary border-none">
                      <Shield size={12} />
                    </Badge>
                  )}
                  <Badge className="bg-background/80 backdrop-blur-sm px-1.5 h-6 text-foreground border-none font-bold text-[10px]">
                    {album.photos?.length || 0} PICS
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5 flex-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 font-bold">{album.date}</p>
                <h3 className="text-sm font-bold text-foreground line-clamp-1">{album.title}</h3>
              </CardContent>

              <CardFooter className="px-5 py-4 border-t border-border/30 flex items-center justify-between">
                <a
                  href={`/gallery/${album.albumId}`}
                  target="_blank"
                  className={cn(
                    buttonVariants({ variant: "link", size: "sm" }),
                    "h-auto p-0 text-[11px] text-muted-foreground hover:text-primary gap-1.5"
                  )}
                >
                  <ExternalLink size={12} />
                  View Public
                </a>

                <AlertDialog>
                  <AlertDialogTrigger
                    className="text-[11px] text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors bg-transparent border-none cursor-pointer font-medium"
                  >
                    <Trash2 size={12} />
                    Delete
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>ยืนยันการลบอัลบั้ม?</AlertDialogTitle>
                      <AlertDialogDescription>
                        การลบอัลบั้ม "{album.title}" จะทำให้รูปภาพทั้งหมดหายไปจากหน้าเว็บ และไม่สามารถกู้คืนได้
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(album.albumId)} variant="destructive">
                        ลบข้อมูลถาวร
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-border/40 rounded-sm">
            <ImageIcon className="mx-auto text-muted-foreground mb-4" size={32} strokeWidth={1} />
            <p className="text-sm text-muted-foreground italic">ยังไม่มีอัลบั้มในแกลเลอรี่</p>
          </div>
        )}
      </div>
    </div>
  );
}
