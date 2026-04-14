"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Package, Tag, Layers } from "lucide-react";

const mockProducts = [
  { id: "p1", name: "Jersey 2026 Home", price: "฿490", stock: 45, category: "เสื้อผ้า" },
  { id: "p2", name: "Official Scarf", price: "฿250", stock: 12, category: "ของที่ระลึก" },
  { id: "p3", name: "AM Hat", price: "฿320", stock: 0, category: "เครื่องประดับ" },
];

export default function AdminShopPage() {
  const [products, setProducts] = useState(mockProducts);

  const handleDelete = (id: string) => {
    if (confirm("ลบสินค้านี้ใช่หรือไม่?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">จัดการร้านค้า</h1>
          <p className="text-sm text-muted-foreground">จัดการข้อมูลสินค้า สต็อก และหมวดหมู่</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-black text-sm font-semibold rounded-sm hover:bg-yellow-300 transition-colors">
          <Plus size={18} />
          เพิ่มสินค้าใหม่
        </button>
      </div>

      <div className="bg-card border border-border/40 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[10px] uppercase text-muted-foreground tracking-widest border-b border-border/40 bg-muted/30">
              <tr>
                <th className="px-6 py-4 font-semibold">สินค้า</th>
                <th className="px-6 py-4 font-semibold text-center">หมวดหมู่</th>
                <th className="px-6 py-4 font-semibold text-center">ราคา</th>
                <th className="px-6 py-4 font-semibold text-center">สต็อก</th>
                <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center shrink-0 border border-border/20">
                        <Tag size={16} className="text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted p-1 px-2 rounded-sm border border-border/20">
                      <Layers size={10} /> {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-foreground">{p.price}</td>
                  <td className="px-6 py-5 text-center px-6">
                    <span className={`text-[11px] font-medium ${p.stock === 0 ? "text-red-500" : "text-emerald-500"}`}>
                      {p.stock === 0 ? "สินค้าหมด" : `${p.stock} ชิ้น`}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Placeholder for Analytics */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-border/40 rounded-sm bg-card">
          <div className="flex items-center gap-3 mb-4">
            <Package size={20} className="text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-widest">ภาพรวมสต็อก</h3>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-2">
            <div className="h-full bg-emerald-500" style={{ width: "70%" }} />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-right">จัดจำหน่ายแล้ว 70%</p>
        </div>
      </div>
    </div>
  );
}
