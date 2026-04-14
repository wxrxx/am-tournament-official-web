"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Package, Tag, Layers, Loader2, X } from "lucide-react";
import { DataService, Product } from "@/services/dataService";
import { isFirebaseConfigured } from "@/lib/firebase";

import { swal } from "@/lib/swal";

export default function AdminShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Product State
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    stock: 0,
    category: "เสื้อผ้า"
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await DataService.getProducts();
    setProducts(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const res = await swal.confirm("ลบสินค้านี้ใช่หรือไม่?", "การดำเนินการนี้ไม่สามารถย้อนกลับได้");
    if (res.isConfirmed) {
      await DataService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      swal.success("ลบสินค้าสำเร็จ");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price <= 0) {
      swal.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSaving(true);
    const success = await DataService.createProduct(newProduct);
    if (success) {
      setIsAdding(false);
      setNewProduct({ name: "", price: 0, stock: 0, category: "เสื้อผ้า" });
      loadProducts();
      swal.success("สร้างสินค้าสำเร็จ");
    } else {
      swal.error("เกิดข้อผิดพลาดในการบันทึก");
    }
    setIsSaving(false);
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">จัดการร้านค้า</h1>
          <p className="text-sm text-muted-foreground">จัดการข้อมูลสินค้า สต็อก และหมวดหมู่</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-black text-sm font-semibold rounded-sm hover:bg-yellow-300 transition-colors"
        >
          <Plus size={18} />
          เพิ่มสินค้าใหม่
        </button>
      </div>

      {!isFirebaseConfigured && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs rounded-sm">
          <strong>Mode Local:</strong> โปรดตั้งค่า Firebase เพื่อบันทึกข้อมูลจริง
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-card border border-border/40 w-full max-w-md p-8 rounded-sm shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold uppercase tracking-widest text-foreground">เพิ่มสินค้าใหม่</h2>
              <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-2">ชื่อสินค้า</label>
                <input 
                  type="text" 
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full bg-muted/30 border border-border/30 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-primary"
                  placeholder="เช่น Official Jersey 2026"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest mb-2">ราคา (บาท)</label>
                  <input 
                    type="number" 
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    className="w-full bg-muted/30 border border-border/30 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest mb-2">สต็อก (ชิ้น)</label>
                  <input 
                    type="number" 
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                    className="w-full bg-muted/30 border border-border/30 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-2">หมวดหมู่</label>
                <select 
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full bg-muted/30 border border-border/30 rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-primary appearance-none"
                >
                  <option value="เสื้อผ้า">เสื้อผ้า</option>
                  <option value="ของที่ระลึก">ของที่ระลึก</option>
                  <option value="เครื่องประดับ">เครื่องประดับ</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-3 bg-primary text-black font-bold text-sm rounded-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : "บันทึกสินค้า"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-card border border-border/40 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[10px] uppercase text-muted-foreground tracking-widest border-b border-border/40 bg-muted/30">
              <tr>
                <th className="px-6 py-4 font-semibold">สินค้า {products.length > 0 && `(${products.length})`}</th>
                <th className="px-6 py-4 font-semibold text-center">หมวดหมู่</th>
                <th className="px-6 py-4 font-semibold text-center">ราคา</th>
                <th className="px-6 py-4 font-semibold text-center">สต็อก</th>
                <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin text-primary inline-block mb-2" size={24} />
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">กำลังโหลดคลังสินค้า...</p>
                  </td>
                </tr>
              ) : products.length > 0 ? products.map((p) => (
                <tr key={p.id} className="hover:bg-muted/10 transition-colors text-[13px]">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center shrink-0 border border-border/20">
                        <Tag size={16} className="text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted p-1 px-2 rounded-sm border border-border/20">
                      <Layers size={10} /> {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-foreground">฿{p.price.toLocaleString()}</td>
                  <td className="px-6 py-5 text-center px-6">
                    <span className={`text-[11px] font-medium ${p.stock <= 0 ? "text-red-500" : "text-emerald-500"}`}>
                      {p.stock <= 0 ? "สินค้าหมด" : `${p.stock} ชิ้น`}
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
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground text-xs italic">
                    ไม่มีสินค้าในคลัง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

