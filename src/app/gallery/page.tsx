"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Image as ImageIcon, Calendar, Camera } from "lucide-react";
import { DataService, GalleryAlbum } from "@/services/dataService";
import { CldImage } from "next-cloudinary";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function GalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getGalleryAlbums().then((res) => {
      setAlbums(res || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-background pb-32 animate-in fade-in duration-700">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-6">
        <div className="space-y-4">
           <Badge variant="outline" className="px-4 py-1 border-primary/40 text-primary font-bold tracking-[0.4em] uppercase text-[10px]">
             Match Media
           </Badge>
           <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">แกลเลอรี่ภาพถ่าย</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-base md:text-lg leading-relaxed">
           บันทึกทุกหยาดเหงื่อและความประทับใจ ภาพถ่ายความละเอียดสูงจากการแข่งขัน AM Tournament ทุกแมตช์สำคัญ
        </p>
      </section>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <Separator className="bg-border/20 mb-16" />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                 <Skeleton className="aspect-[4/3] w-full rounded-sm" />
                 <Skeleton className="h-6 w-3/4" />
                 <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="py-24 border-2 border-dashed border-border/40 rounded-sm text-center flex flex-col items-center justify-center space-y-4">
            <ImageIcon className="text-muted-foreground opacity-20" size={48} />
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">ยังไม่มีอัลบั้มภาพในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album) => (
              <Link
                key={album.albumId}
                href={`/gallery/${album.albumId}`}
                className="group"
              >
                <Card className="border-none bg-transparent shadow-none overflow-hidden hover:translate-y-[-4px] transition-transform duration-300">
                  {/* Image Container */}
                  <div className="aspect-[4/3] relative overflow-hidden rounded-sm bg-muted mb-6 shadow-md border border-border/10">
                    {album.coverUrl.includes("cloudinary") ? (
                      <CldImage
                        src={album.coverUrl}
                        alt={album.title}
                        width={800}
                        height={600}
                        crop="fill"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                    
                    <div className="absolute top-3 right-3 flex gap-2">
                       {album.isProtected && (
                         <Badge className="bg-background/90 backdrop-blur-md text-foreground border-none font-bold text-[9px] h-6 px-2 gap-1.5 shadow-sm">
                           <Lock size={10} className="text-primary" /> PROTECTED
                         </Badge>
                       )}
                       <Badge className="bg-background/90 backdrop-blur-md text-foreground border-none font-bold text-[9px] h-6 px-2 gap-1.5 shadow-sm">
                          <Camera size={10} className="text-primary" /> {album.photos?.length || 0}
                       </Badge>
                    </div>
                  </div>

                  {/* Caption */}
                  <CardContent className="p-0 space-y-2">
                    <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
                      {album.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                       <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-primary/60" />
                          {album.date}
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-32 flex flex-col items-center space-y-8">
         <Separator className="bg-border/20" />
         <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground opacity-50">
            Professional Sports Photography // High Resolution // Digital Rights Reserved
         </p>
      </div>
    </div>
  );
}
