"use client";

import { useState } from "react";
import { Plus, Edit2, Zap, Target, Star, MoreHorizontal } from "lucide-react";

const mockPackages = [
  { id: "pk1", name: "Starter", price: "฿1,500", icon: Zap, features: 3, status: "Active" },
  { id: "pk2", name: "Professional", price: "฿4,500", icon: Target, features: 5, status: "Active" },
  { id: "pk3", name: "Ultimate", price: "฿9,500", icon: Star, features: 8, status: "Active" },
];

export default function AdminPackagesPage() {
  const [packages] = useState(mockPackages);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">จัดการแพ็กเกจทีม</h1>
          <p className="text-sm text-muted-foreground">ปรับแต่งราคาและฟีเจอร์สำหรับบริการถ่ายรูปทีม</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-black text-sm font-semibold rounded-sm hover:bg-yellow-300 transition-colors">
          <Plus size={18} />
          เพิ่มแพ็กเกจ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-card border border-border/40 rounded-sm p-8 flex flex-col relative group">
            <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 transition-colors">
              <MoreHorizontal size={18} />
            </button>
            
            <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center mb-6">
              <pkg.icon size={24} className="text-primary" />
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-1">{pkg.name}</h3>
            <p className="text-2xl font-bold text-foreground mb-4">{pkg.price}</p>
            
            <div className="space-y-3 mb-8">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">ฟีเจอร์ปัจจุบัน</p>
              <p className="text-sm text-foreground">• {pkg.features} รายการหลัก</p>
              <p className="text-sm text-foreground">• รองรับการเข้าถึงหน้าแกลเลอรี่</p>
            </div>

            <button className="mt-auto w-full flex items-center justify-center gap-2 py-3 border border-border hover:border-foreground/50 transition-colors text-xs font-semibold rounded-sm">
              <Edit2 size={14} />
              แก้ไขรายละเอียด
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 p-6 border border-border/40 bg-card rounded-sm border-l-4 border-l-primary">
        <h4 className="text-sm font-semibold text-foreground mb-2">ข้อมูลเสริม (Documentation)</h4>
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          การเปลี่ยนแปลงราคาในระบบ Admin นี้จะเป็นแบบ Real-time หลังจากคุณเชื่อมต่อระบบฐานข้อมูล (เช่น Supabase) 
          คุณสามารถนำ `packageId` ไปอ้างอิงกับระบบการแจ้งชำระเงินเพื่อตรวจสอบยอดแบบอัตโนมัติได้
        </p>
      </div>
    </div>
  );
}
