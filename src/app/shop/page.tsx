"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DataService, Product } from "@/services/dataService";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CldImage } from "next-cloudinary";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getProducts().then((res) => {
      setProducts(res || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-background animate-in fade-in duration-700">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-4">
        <Badge variant="outline" className="px-4 py-1 border-primary/40 text-primary font-bold tracking-widest uppercase text-[10px]">
          Official Shop
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">AM MERCHANDISE</h1>
        <p className="text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed">
          เลือกเป็นเจ้าของสินค้าลิขสิทธิ์แท้จากสโมสร และร่วมสนับสนุนทัวร์นาเมนต์ฟุตบอลที่ยิ่งใหญ่ที่สุดในสตูล
        </p>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/5] w-full rounded-lg" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-32 gap-8">
            {/* Icon */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl scale-150" />
              <div className="relative w-24 h-24 rounded-full border border-border/20 bg-card flex items-center justify-center shadow-inner">
                <svg
                  className="w-10 h-10 text-muted-foreground/40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Shopping bag outline */}
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
            </div>

            {/* Copy */}
            <div className="text-center space-y-2 max-w-sm">
              <p className="text-base font-semibold text-foreground tracking-tight">
                ยังไม่มีสินค้าในขณะนี้
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                สินค้าคอลเลกชันใหม่กำลังจะมาเร็ว ๆ นี้<br />
                ติดตามความเคลื่อนไหวของเราได้เลย
              </p>
            </div>

            {/* Divider label */}
            <div className="flex items-center gap-4 w-full max-w-xs">
              <div className="flex-1 h-px bg-border/30" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold">Coming Soon</span>
              <div className="flex-1 h-px bg-border/30" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {products.map((p) => (
              <Card key={p.id} className="h-full flex flex-col overflow-hidden border border-border/10 bg-card hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 rounded-lg group p-0">
                {/* Image container — padded so image sits centred with breathing room */}
                <Link
                  href={`/shop/checkout?type=product&id=${p.id}&price=${p.price || 0}&name=${encodeURIComponent(p.name || "")}`}
                  className="block w-full bg-muted/5 px-6 pt-6 pb-3"
                >
                  {/* Badge */}
                  <div className="flex justify-start mb-3">
                    <Badge className="bg-primary/20 text-primary backdrop-blur-md border border-primary/20 font-bold uppercase text-[8px] tracking-widest px-2 py-0.5 shadow-sm">
                      {p.category || "Merch"}
                    </Badge>
                  </div>

                  {/* Constrained image wrapper — ~65% of card width, centred */}
                  <div className="relative mx-auto w-[65%] aspect-square overflow-hidden">
                    {p.image ? (
                      <CldImage
                        src={p.image}
                        alt={p.name || "Product"}
                        fill
                        className="object-contain object-center group-hover:scale-[1.04] transition-transform duration-700 ease-out drop-shadow-md"
                        sizes="(max-width: 768px) 35vw, 22vw"
                      />
                    ) : (
                      /* Placeholder when no image is set */
                      <div className="w-full h-full flex items-center justify-center bg-muted/10 rounded">
                        <svg
                          className="w-10 h-10 text-muted-foreground/20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                <CardContent className="px-4 pt-4 pb-2 flex-grow">
                  <Link
                    href={`/shop/checkout?type=product&id=${p.id}&price=${p.price || 0}&name=${encodeURIComponent(p.name || "")}`}
                    className="hover:text-primary transition-colors"
                  >
                    <h3 className="text-sm md:text-base font-medium text-foreground leading-tight line-clamp-1">
                      {p.name}
                    </h3>
                  </Link>
                </CardContent>

                <CardFooter className="px-4 pb-4 pt-2 flex items-center justify-between gap-2 border-t border-border/5 mt-auto">
                  <p className="text-lg font-bold text-primary">
                    ฿{(p.price || 0).toLocaleString()}
                  </p>
                  <Link href={`/shop/checkout?type=product&id=${p.id}&price=${p.price || 0}&name=${encodeURIComponent(p.name || "")}`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-black hover:bg-primary/90 h-8 px-4 text-[10px] font-bold uppercase tracking-wider">
                    ซื้อ
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-12 border-t border-border/20 pt-12 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 grayscale">
        <p className="text-[10px] uppercase tracking-widest font-bold">Secure Checkout</p>
        <p className="text-[10px] uppercase tracking-widest font-bold">Official Licensee</p>
        <p className="text-[10px] uppercase tracking-widest font-bold">Limited Edition 2026</p>
      </div>
    </div>
  );
}
