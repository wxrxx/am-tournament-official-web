"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DataService, Product } from "@/services/dataService";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getProducts().then((res) => {
      setProducts(res || []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="pt-32 flex justify-center text-muted-foreground text-sm animate-pulse">
      กำลังดึงข้อมูลสินค้า...
    </div>
  );

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <h1 className="text-2xl font-semibold text-foreground mb-3">ร้านค้า</h1>
        <p className="text-sm text-muted-foreground">
          สินค้า Official Merchandise ลิขสิทธิ์แท้จาก AM Tournament
        </p>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {products.length === 0 ? (
          <div className="py-20 border border-dashed border-border/60 rounded-sm text-center">
            <p className="text-sm text-muted-foreground">ยังไม่มีสินค้าในร้านค้าขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/shop/checkout?type=product&id=${p.id}&price=${p.price}&name=${encodeURIComponent(p.name)}`}
                className="group block"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-sm bg-muted mb-4">
                  {p.image ? (
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-[1.03] transition-transform duration-500"
                      style={{ backgroundImage: `url('${p.image}')` }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/50">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">No Image</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
                  {p.category}
                </p>
                <h3 className="text-sm font-medium text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                <p className="text-sm font-semibold text-foreground">{p.price.toLocaleString()} ฿</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
