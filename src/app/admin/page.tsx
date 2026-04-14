"use client";

import { Users, Image as ImageIcon, ShoppingBag, CreditCard, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "จำนวนรูปภาพ", value: "1,248", icon: ImageIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "รายการสั่งซื้อ", value: "156", icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "สมาชิกทีม", value: "32 ทีม", icon: Users, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "รายได้รวม (Mock)", value: "฿45,200", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-foreground mb-2">แผงควบคุมระบบ (Dashboard)</h1>
        <p className="text-sm text-muted-foreground">สรุปข้อมูลภาพรวมของ AM Tournament ฤดูกาล 2026</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card border border-border/40 p-6 rounded-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-sm ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">รวม</span>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity (Mock) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border/40 rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">นัดล่าสุด</h2>
            <button className="text-[11px] text-primary hover:underline">ดูทั้งหมด</button>
          </div>
          <div className="space-y-4">
            {[
              { match: "Satun FC vs City Boys", score: "2-1", status: "เสร็จสิ้น" },
              { match: "Ratchada UTD vs North Kings", score: "-", status: "กำลังแข่ง" },
              { match: "Lipe Marines vs Mueang Thong FC", score: "-", status: "เร็วๆ นี้" },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border/30 rounded-sm text-sm">
                <span className="font-medium text-foreground">{m.match}</span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-foreground">{m.score}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    m.status === "เสร็จสิ้น" ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
                  }`}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border/40 rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">ออเดอร์ล่าสุด</h2>
            <button className="text-[11px] text-primary hover:underline">ดูทั้งหมด</button>
          </div>
          <div className="space-y-4">
            {[
              { id: "#ORD001", item: "เสื้อ Jersey XL", price: "฿490", user: "Waris" },
              { id: "#ORD002", item: "แพ็กเกจ Starter", price: "฿1,500", user: "Somchai" },
              { id: "#ORD003", item: "ชุดภาพนัดชิง", price: "฿100", user: "Anan" },
            ].map((o, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border/30 rounded-sm text-sm">
                <div>
                  <p className="font-medium text-foreground">{o.item}</p>
                  <p className="text-[10px] text-muted-foreground">{o.id} - โดย {o.user}</p>
                </div>
                <span className="font-bold text-foreground">{o.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-12 p-6 border border-primary/20 bg-primary/5 rounded-sm">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-bold text-primary mr-2">NOTICE:</span> 
          พื้นที่นี้ถูกออกแบบมาเพื่อความง่ายในการขยายผล (Scalable) คุณสามารถเชื่อมต่อ Supabase SDK เข้ากับ `DataService.ts` เพื่อดึงข้อมูลจริงมาแทนที่ Mock Data เหล่านี้ได้ทันที
        </p>
      </div>
    </div>
  );
}
