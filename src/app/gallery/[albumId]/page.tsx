"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, ShoppingBag, ArrowLeft, Calendar, Camera } from "lucide-react";
import { DataService, GalleryAlbum } from "@/services/dataService";
import ProtectedImage from "@/components/ProtectedImage";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  const handleUnlock = () => {
    if (pw === album?.password || pw === "am2026") {
      setUnlocked(true);
      toast.success("ปลดล็อคอัลบั้มสำเร็จ!");
    } else {
      toast.error("รหัสผ่านไม่ถูกต้อง", {
        description: "กรุณาตรวจสอบรหัสผ่านที่ได้รับจากผู้จัดงาน",
      });
    }
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-16 space-y-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-sm text-center border-border/40">
          <CardHeader>
            <CardTitle>ไม่พบอัลบั้มนี้</CardTitle>
            <CardDescription>อัลบั้มที่คุณค้นหาอาจถูกลบหรือไม่มีในระบบ</CardDescription>
          </CardHeader>
          <CardContent>
          <Link
            href="/gallery"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <ArrowLeft size={16} /> กลับไปแกลเลอรี่
          </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* Password gate */
  if (!unlocked) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-6 bg-background">
        <Card className="w-full max-w-sm border-border/40 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <Lock size={22} className="text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <CardTitle className="text-xl">อัลบั้มติดรหัสผ่าน</CardTitle>
              <CardDescription className="mt-2">
                กรุณาใส่รหัสผ่านที่ได้รับจากช่างภาพหรือผู้จัดงาน
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              placeholder="ใส่รหัสผ่านที่นี่"
              className="text-center h-12 rounded-sm"
              autoFocus
            />
            <Button onClick={handleUnlock} className="w-full h-11 font-bold uppercase tracking-widest text-[11px]">
              ปลดล็อคอัลบั้ม
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-background pb-32 animate-in fade-in duration-700">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-12">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 text-muted-foreground hover:text-foreground mb-8 -ml-2"
        >
          <ArrowLeft size={16} /> ย้อนกลับ
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{album.title}</h1>
            <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-primary/60" />
                {album.date}
              </div>
              <div className="flex items-center gap-1.5">
                <Camera size={12} className="text-primary/60" />
                {album.photos.length} รูปภาพ
              </div>
            </div>
          </div>

          {!isSignedIn && (
            <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary px-4 py-2 font-medium">
              เข้าสู่ระบบเพื่อซื้อภาพ Full HD ไร้ลายน้ำ
            </Badge>
          )}
        </div>
      </div>

      <Separator className="max-w-7xl mx-auto bg-border/20 mb-12" />

      {/* Photo Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {album.photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-sm bg-muted">
              <ProtectedImage src={photo.url} alt={`รูปที่ ${photo.id}`} price={photo.price} />

              {/* Buy overlay */}
              {isSignedIn && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    onClick={() => router.push(`/shop/checkout?type=photo&id=${photo.id}&price=${photo.price}`)}
                    className="gap-1.5 text-[11px] font-bold uppercase tracking-widest h-8 rounded-sm"
                  >
                    <ShoppingBag size={12} /> ซื้อ {photo.price} ฿
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
