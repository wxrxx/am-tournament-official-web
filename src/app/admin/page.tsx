"use client";

import { useEffect, useState } from "react";
import { Users, Image as ImageIcon, ShoppingBag, CreditCard, TrendingUp, Loader2 } from "lucide-react";
import { DataService } from "@/services/dataService";
import { isFirebaseConfigured } from "@/lib/firebase";

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState({
    images: 0,
    orders: 0,
    teams: 12, // Still mock or can fetch later
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [albums, orders] = await Promise.all([
          DataService.getGalleryAlbums(),
          DataService.getOrders(5)
        ]);

        const totalImages = albums.reduce((sum, album) => sum + (album.photos?.length || 0), 0);
        const totalRevenue = orders
          .filter(o => o.status === "Confirmed")
          .reduce((sum, o) => sum + (Number(o.price) || 0), 0);

        setStatsData({
          images: totalImages,
          orders: orders.length,
          teams: 12,
          revenue: totalRevenue
        });
        setRecentOrders(orders);
        setRecentAlbums(albums.slice(0, 5));
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      }
      setIsLoading(false);
    }

    loadDashboardData();
  }, []);

  const stats = [
    { label: "จำนวนรูปภาพ", value: statsData.images.toLocaleString(), icon: ImageIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "รายการสั่งซื้อ", value: statsData.orders.toLocaleString(), icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "สมาชิกทีม", value: `${statsData.teams} ทีม`, icon: Users, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "รายได้รวม (Confirmed)", value: `฿${statsData.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">แผงควบคุมระบบ (Dashboard)</h1>
          <p className="text-sm text-muted-foreground">สรุปข้อมูลภาพรวมของ AM Tournament ฤดูกาล 2026</p>
        </div>
        {isFirebaseConfigured && (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            LIVE MODE
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 border border-border/20 rounded-sm bg-card/50">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground uppercase tracking-widest">กำลังดึงข้อมูลเรียลไทม์...</p>
        </div>
      ) : (
        <>
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

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card border border-border/40 rounded-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">อัลบั้มล่าสุด</h2>
                <a href="/admin/gallery" className="text-[11px] text-primary hover:underline">ดูทั้งหมด</a>
              </div>
              <div className="space-y-4">
                {recentAlbums.length > 0 ? recentAlbums.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-border/30 rounded-sm text-sm">
                    <span className="font-medium text-foreground">{m.title}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-muted-foreground">{m.date}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {m.photos?.length || 0} รูป
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-10 text-xs text-muted-foreground italic">ไม่มีข้อมูลอัลบั้ม</p>
                )}
              </div>
            </div>

            <div className="bg-card border border-border/40 rounded-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest">ออเดอร์ล่าสุด</h2>
                <a href="/admin/orders" className="text-[11px] text-primary hover:underline">ดูทั้งหมด</a>
              </div>
              <div className="space-y-4">
                {recentOrders.length > 0 ? recentOrders.map((o, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-border/30 rounded-sm text-sm">
                    <div>
                      <p className="font-medium text-foreground">{o.item || "ไม่มีชื่อสินค้า"}</p>
                      <p className="text-[10px] text-muted-foreground">โดย {o.user || "ผู้ใช้ทั่วไป"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">฿{(Number(o.price) || 0).toLocaleString()}</p>
                      <p className={`text-[9px] uppercase font-bold ${o.status === "Confirmed" ? "text-emerald-500" : "text-yellow-500"}`}>
                        {o.status === "Confirmed" ? "ยืนยันแล้ว" : "รอดำเนินการ"}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-10 text-xs text-muted-foreground italic">ไม่มีรายการสั่งซื้อ</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="mt-12 p-6 border border-primary/20 bg-primary/5 rounded-sm">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-bold text-primary mr-2">SYSTEM STATUS:</span> 
          ขณะนี้ระบบกำลังเชื่อมต่อกับ **{isFirebaseConfigured ? "🔥 Google Firebase" : "📁 Local Storage"}** 
          {isFirebaseConfigured ? " ข้อมูลทั้งหมดถูกดึงและบันทึกแบบเรียลไทม์" : " ข้อมูลที่คุณเห็นเป็นเพียงตัวอย่าง (Read-Only)"}
        </p>
      </div>
    </div>
  );
}

