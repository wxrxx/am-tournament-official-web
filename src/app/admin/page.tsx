"use client";

import { useEffect, useState } from "react";
import { Users, Image as ImageIcon, ShoppingBag, CreditCard, TrendingUp, Loader2, ArrowRight } from "lucide-react";
import { DataService } from "@/services/dataService";
import { isFirebaseConfigured } from "@/lib/firebase";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState({
    images: 0,
    orders: 0,
    teams: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentAlbums, setRecentAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [albums, orders, teamsList] = await Promise.all([
          DataService.getGalleryAlbums(),
          DataService.getOrders(5),
          DataService.getTeams()
        ]);

        const totalImages = albums.reduce((sum, album) => sum + (album.photos?.length || 0), 0);
        const totalRevenue = orders
          .filter(o => o.status === "Confirmed")
          .reduce((sum, o) => sum + (Number(o.price) || 0), 0);

        setStatsData({
          images: totalImages,
          orders: orders.length,
          teams: teamsList ? teamsList.length : 0,
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
    { label: "จำนวนรูปภาพรวม", value: statsData.images.toLocaleString(), icon: ImageIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "รายการสั่งซื้อทั้งหมด", value: statsData.orders.toLocaleString(), icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "สมาชิกทีมทางการ", value: `${statsData.teams} ทีม`, icon: Users, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "รายได้ที่ได้รับการยืนยัน", value: `฿${statsData.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">แผงควบคุมระบบ</h1>
          <p className="text-muted-foreground">สรุปข้อมูลภาพรวมของ AM Tournament ฤดูกาล 2026</p>
        </div>
        {isFirebaseConfigured && (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 py-1 px-4 text-xs font-bold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            LIVE MODE
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-sm" />
          ))}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className="border-border/40 shadow-sm overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <div className={`p-2 rounded-sm ${stat.bg}`}>
                      <Icon size={16} className={stat.color} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">
                      Updated just now
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 border-border/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">อัลบั้มล่าสุด</CardTitle>
                  <CardDescription className="text-xs mt-1">แกลเลอรี่อัพเดทล่าสุด</CardDescription>
                </div>
                <Link
                  href="/admin/gallery"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-[11px] text-primary")}
                >
                  ดูทั้งหมด
                </Link>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recentAlbums.length > 0 ? recentAlbums.map((m, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors cursor-pointer">{m.title}</p>
                        <p className="text-[10px] text-muted-foreground">{m.date}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {m.photos?.length || 0} รูป
                      </Badge>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-xs text-muted-foreground italic">ไม่มีข้อมูลอัลบั้ม</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-border/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">ออเดอร์ล่าสุด</CardTitle>
                  <CardDescription className="text-xs mt-1">รายการสั่งซื้อภาพและสินค้า</CardDescription>
                </div>
                <Link
                  href="/admin/orders"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-[11px] text-primary")}
                >
                  ดูทั้งหมด
                </Link>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {recentOrders.length > 0 ? recentOrders.map((o, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center text-muted-foreground">
                            <ShoppingBag size={18} />
                         </div>
                         <div>
                            <p className="text-sm font-medium leading-none">{o.name || "ไม่มีชื่อสินค้า"}</p>
                            <p className="text-xs text-muted-foreground mt-1">โดย {o.user || "ผู้ใช้ทั่วไป"}</p>
                         </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">฿{(Number(o.price) || 0).toLocaleString()}</p>
                        <Badge variant={o.status === "Confirmed" ? "default" : "outline"} 
                          className={`text-[9px] h-5 mt-1 ${o.status === "Confirmed" ? "bg-emerald-500 text-white" : "border-yellow-500/50 text-yellow-600"}`}>
                          {o.status === "Confirmed" ? "ยืนยันแล้ว" : "รอดำเนินการ"}
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-xs text-muted-foreground italic">ไม่มีรายการสั่งซื้อ</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {/* Status banner removed for cleaner UI */}
    </div>
  );
}
