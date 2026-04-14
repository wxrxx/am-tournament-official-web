"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Zap, Target, Star, MoreHorizontal, Loader2, CheckCircle2 } from "lucide-react";
import { DataService, Package } from "@/services/dataService";
import { isFirebaseConfigured } from "@/lib/firebase";

const iconMap: Record<string, any> = {
  "Starter": Zap,
  "Professional": Target,
  "Ultimate": Star,
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setIsLoading(true);
    const data = await DataService.getPackages();
    setPackages(data);
    setIsLoading(false);
  };

  const handleStatusToggle = async (pkg: Package) => {
    const newStatus = pkg.status === "Active" ? "Inactive" : "Active";
    const success = await DataService.updatePackage(pkg.id, { status: newStatus });
    if (success) {
      setPackages(packages.map(p => p.id === pkg.id ? { ...p, status: newStatus } : p));
    }
  };

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

      {!isFirebaseConfigured && (
        <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs rounded-sm">
          <strong>Mode Local:</strong> โปรดตั้งค่า Firebase เพื่อเชื่อมต่อแพ็กเกจจริง
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-card h-64 border border-border/40 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.length > 0 ? packages.map((pkg) => {
            const Icon = iconMap[pkg.name] || Zap;
            return (
              <div key={pkg.id} className="bg-card border border-border/40 rounded-sm p-8 flex flex-col relative group">
                <button 
                  onClick={() => handleStatusToggle(pkg)}
                  className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                  pkg.status === "Active" 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-muted text-muted-foreground border-border/40"
                }`}>
                  {pkg.status}
                </button>
                
                <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center mb-6">
                  <Icon size={24} className="text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-1">{pkg.name}</h3>
                <p className="text-2xl font-bold text-foreground mb-4">฿{pkg.price.toLocaleString()}</p>
                
                <div className="space-y-3 mb-8">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">ฟีเจอร์ปัจจุบัน</p>
                  {pkg.features.map((f, i) => (
                    <p key={i} className="text-sm text-foreground flex items-center gap-2">
                       <CheckCircle2 size={12} className="text-primary" /> {f}
                    </p>
                  ))}
                </div>

                <button className="mt-auto w-full flex items-center justify-center gap-2 py-3 border border-border hover:border-foreground/50 transition-colors text-xs font-semibold rounded-sm">
                  <Edit2 size={14} />
                  แก้ไขรายละเอียด
                </button>
              </div>
            );
          }) : (
            <div className="col-span-full border border-dashed border-border rounded-sm py-20 text-center text-muted-foreground text-sm italic">
              ไม่มีแพ็กเกจในระบบ
            </div>
          )}
        </div>
      )}

      <div className="mt-16 p-6 border border-border/40 bg-card rounded-sm border-l-4 border-l-primary">
        <h4 className="text-sm font-semibold text-foreground mb-2">ข้อมูลเสริม (Documentation)</h4>
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          การเปลี่ยนแปลงราคาในระบบ Admin นี้จะเป็นแบบ Real-time ข้อมูลจะถูกดึงมาจาก Firestore โดยตรง 
          และจะมีผลกับหน้ารายละเอียดแพ็กเกจที่ผู้ใช้เห็นทันที
        </p>
      </div>
    </div>
  );
}

