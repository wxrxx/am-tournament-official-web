import Link from "next/link";

export const metadata = { title: "ร้านค้า | AM Tournament" };

const products = [
  {
    id: "prod_001",
    name: "เสื้อแข่งขัน AM Tournament 2026 (เหย้า)",
    price: 490,
    category: "เสื้อผ้า",
    image: "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=800&q=80",
  },
  {
    id: "prod_002",
    name: "เสื้อแข่งขัน AM Tournament 2026 (เยือน)",
    price: 490,
    category: "เสื้อผ้า",
    image: "https://images.unsplash.com/photo-1568252542512-9fe8cf4c8cae?w=800&q=80",
  },
  {
    id: "prod_003",
    name: "ลูกฟุตบอลฝึกซ้อมมาตรฐานโปร",
    price: 850,
    category: "อุปกรณ์",
    image: "https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&q=80",
  },
  {
    id: "prod_004",
    name: "ผ้าพันคอเชียร์",
    price: 250,
    category: "ของที่ระลึก",
    image: "https://images.unsplash.com/photo-1606132049618-5a484c207ab7?w=800&q=80",
  },
];

export default function ShopPage() {
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/shop/checkout?type=product&id=${p.id}&price=${p.price}&name=${encodeURIComponent(p.name)}`}
              className="group block"
            >
              <div className="aspect-[3/4] overflow-hidden rounded-sm bg-muted mb-4">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-[1.03] transition-transform duration-500"
                  style={{ backgroundImage: `url('${p.image}')` }}
                />
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
      </div>
    </div>
  );
}
