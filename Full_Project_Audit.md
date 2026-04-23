# Full Project Audit


## File: src/app/admin/page.tsx

`$lang
"use client";

import { useEffect, useState } from "react";
import { Users, Image as ImageIcon, ShoppingBag, CreditCard, TrendingUp, Loader2, ArrowRight } from "lucide-react";
import { DataService } from "@/services/dataService";
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
    { label: "à¸ˆà¸³à¸™à¸§à¸™à¸£à¸¹à¸›à¸ à¸²à¸žà¸£à¸§à¸¡", value: statsData.images.toLocaleString(), icon: ImageIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "à¸£à¸²à¸¢à¸à¸²à¸£à¸ªà¸±à¹ˆà¸‡à¸‹à¸·à¹‰à¸­à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”", value: statsData.orders.toLocaleString(), icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "à¸ªà¸¡à¸²à¸Šà¸´à¸à¸—à¸µà¸¡à¸—à¸²à¸‡à¸à¸²à¸£", value: `${statsData.teams} à¸—à¸µà¸¡`, icon: Users, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "à¸£à¸²à¸¢à¹„à¸”à¹‰à¸—à¸µà¹ˆà¹„à¸”à¹‰à¸£à¸±à¸šà¸à¸²à¸£à¸¢à¸·à¸™à¸¢à¸±à¸™", value: `à¸¿${statsData.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">à¹à¸œà¸‡à¸„à¸§à¸šà¸„à¸¸à¸¡à¸£à¸°à¸šà¸š</h1>
          <p className="text-muted-foreground">à¸ªà¸£à¸¸à¸›à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ à¸²à¸žà¸£à¸§à¸¡à¸‚à¸­à¸‡ AM Tournament à¸¤à¸”à¸¹à¸à¸²à¸¥ 2026</p>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 py-1 px-4 text-xs font-bold">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          LIVE MODE
        </Badge>
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
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">à¸­à¸±à¸¥à¸šà¸±à¹‰à¸¡à¸¥à¹ˆà¸²à¸ªà¸¸à¸”</CardTitle>
                  <CardDescription className="text-xs mt-1">à¹à¸à¸¥à¹€à¸¥à¸­à¸£à¸µà¹ˆà¸­à¸±à¸žà¹€à¸”à¸—à¸¥à¹ˆà¸²à¸ªà¸¸à¸”</CardDescription>
                </div>
                <Link
                  href="/admin/gallery"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-[11px] text-primary")}
                >
                  à¸”à¸¹à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”
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
                        {m.photos?.length || 0} à¸£à¸¹à¸›
                      </Badge>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-xs text-muted-foreground italic">à¹„à¸¡à¹ˆà¸¡à¸µà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸­à¸±à¸¥à¸šà¸±à¹‰à¸¡</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-border/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">à¸­à¸­à¹€à¸”à¸­à¸£à¹Œà¸¥à¹ˆà¸²à¸ªà¸¸à¸”</CardTitle>
                  <CardDescription className="text-xs mt-1">à¸£à¸²à¸¢à¸à¸²à¸£à¸ªà¸±à¹ˆà¸‡à¸‹à¸·à¹‰à¸­à¸ à¸²à¸žà¹à¸¥à¸°à¸ªà¸´à¸™à¸„à¹‰à¸²</CardDescription>
                </div>
                <Link
                  href="/admin/orders"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-[11px] text-primary")}
                >
                  à¸”à¸¹à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”
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
                            <p className="text-sm font-medium leading-none">{o.name || "à¹„à¸¡à¹ˆà¸¡à¸µà¸Šà¸·à¹ˆà¸­à¸ªà¸´à¸™à¸„à¹‰à¸²"}</p>
                            <p className="text-xs text-muted-foreground mt-1">à¹‚à¸”à¸¢ {o.user || "à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸—à¸±à¹ˆà¸§à¹„à¸›"}</p>
                         </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">à¸¿{(Number(o.price) || 0).toLocaleString()}</p>
                        <Badge variant={o.status === "Confirmed" ? "default" : "outline"} 
                          className={`text-[9px] h-5 mt-1 ${o.status === "Confirmed" ? "bg-emerald-500 text-white" : "border-yellow-500/50 text-yellow-600"}`}>
                          {o.status === "Confirmed" ? "à¸¢à¸·à¸™à¸¢à¸±à¸™à¹à¸¥à¹‰à¸§" : "à¸£à¸­à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£"}
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-xs text-muted-foreground italic">à¹„à¸¡à¹ˆà¸¡à¸µà¸£à¸²à¸¢à¸à¸²à¸£à¸ªà¸±à¹ˆà¸‡à¸‹à¸·à¹‰à¸­</p>
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

``n

## File: src/app/admin/competitions/page.tsx

`$lang
"use client";

import { useState, useEffect, useCallback } from "react";
import { DataService, Competition } from "@/services/dataService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

const emptyForm: Partial<Competition> = {
  name: "",
  type: "11 à¸„à¸™",
  maxPlayers: 11,
  maxAge: "à¹„à¸¡à¹ˆà¸ˆà¸³à¸à¸±à¸”",
  teamQuota: 16,
  entryFee: 0,
  startDate: "",
  endDate: "",
  status: "Open",
  numberOfGroups: 4,
  teamsPerGroup: 4,
};

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Competition | null>(null);
  const [form, setForm] = useState<Partial<Competition>>(emptyForm);

  const fetch = useCallback(async () => {
    setLoading(true);
    const data = await DataService.getCompetitions();
    setCompetitions(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (comp: Competition) => {
    setEditTarget(comp);
    setForm({ ...comp });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) { toast.error("à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸Šà¸·à¹ˆà¸­à¸£à¸²à¸¢à¸à¸²à¸£"); return; }
    if (!form.startDate || !form.endDate) { toast.error("à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸§à¸±à¸™à¸—à¸µà¹ˆà¹€à¸›à¸´à¸”/à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£"); return; }
    setSaving(true);
    let ok = false;
    if (editTarget) {
      ok = await DataService.updateCompetition(editTarget.id, form);
    } else {
      ok = await DataService.createCompetition(form);
    }
    setSaving(false);
    if (ok) {
      toast.success(editTarget ? "à¹à¸à¹‰à¹„à¸‚à¸£à¸²à¸¢à¸à¸²à¸£à¸ªà¸³à¹€à¸£à¹‡à¸ˆ" : "à¹€à¸žà¸´à¹ˆà¸¡à¸£à¸²à¸¢à¸à¸²à¸£à¸ªà¸³à¹€à¸£à¹‡à¸ˆ");
      setDialogOpen(false);
      fetch();
    } else {
      toast.error("à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸” à¸à¸£à¸¸à¸“à¸²à¸¥à¸­à¸‡à¹ƒà¸«à¸¡à¹ˆ");
    }
  };

  const handleToggle = async (comp: Competition) => {
    const newStatus = comp.status === "Open" ? "Closed" : "Open";
    const ok = await DataService.updateCompetition(comp.id, { status: newStatus });
    if (ok) {
      toast.success(`${newStatus === "Open" ? "à¹€à¸›à¸´à¸”" : "à¸›à¸´à¸”"}à¸à¸²à¸£à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£à¹à¸¥à¹‰à¸§`);
      fetch();
    } else {
      toast.error("à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”");
    }
  };

  const handleDelete = async (comp: Competition) => {
    const result = await Swal.fire({
      title: "à¸¥à¸šà¸£à¸²à¸¢à¸à¸²à¸£à¸™à¸µà¹‰?",
      text: `"${comp.name}" à¸ˆà¸°à¸–à¸¹à¸à¸¥à¸šà¸­à¸­à¸à¸–à¸²à¸§à¸£ à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸à¸¹à¹‰à¸„à¸·à¸™à¹„à¸”à¹‰`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "à¸¥à¸šà¹€à¸¥à¸¢",
      cancelButtonText: "à¸¢à¸à¹€à¸¥à¸´à¸",
      background: "hsl(var(--card))",
      color: "hsl(var(--foreground))",
    });
    if (!result.isConfirmed) return;
    const ok = await DataService.deleteCompetition(comp.id);
    if (ok) {
      toast.success("à¸¥à¸šà¸£à¸²à¸¢à¸à¸²à¸£à¸ªà¸³à¹€à¸£à¹‡à¸ˆ");
      fetch();
    } else {
      toast.error("à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”");
    }
  };

  const field = (key: keyof Competition, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
              <Trophy size={16} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">à¸ˆà¸±à¸”à¸à¸²à¸£à¸£à¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-11">à¹€à¸žà¸´à¹ˆà¸¡ à¹à¸à¹‰à¹„à¸‚ à¹à¸¥à¸°à¸„à¸§à¸šà¸„à¸¸à¸¡à¸à¸²à¸£à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£à¹à¸•à¹ˆà¸¥à¸°à¸£à¸²à¸¢à¸à¸²à¸£</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-primary text-black hover:bg-primary/90">
          <Plus size={16} />
          à¹€à¸žà¸´à¹ˆà¸¡à¸£à¸²à¸¢à¸à¸²à¸£à¹ƒà¸«à¸¡à¹ˆ
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/40 overflow-hidden bg-card">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : competitions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Trophy size={28} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸£à¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™</p>
              <p className="text-muted-foreground text-sm mt-1">à¸„à¸¥à¸´à¸ &quot;à¹€à¸žà¸´à¹ˆà¸¡à¸£à¸²à¸¢à¸à¸²à¸£à¹ƒà¸«à¸¡à¹ˆ&quot; à¹€à¸žà¸·à¹ˆà¸­à¹€à¸£à¸´à¹ˆà¸¡à¸•à¹‰à¸™</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">à¸£à¸²à¸¢à¸à¸²à¸£</TableHead>
                <TableHead className="font-semibold text-foreground">à¸›à¸£à¸°à¹€à¸ à¸—</TableHead>
                <TableHead className="font-semibold text-foreground text-center">à¸œà¸¹à¹‰à¹€à¸¥à¹ˆà¸™</TableHead>
                <TableHead className="font-semibold text-foreground text-center">à¸­à¸²à¸¢à¸¸à¸ªà¸¹à¸‡à¸ªà¸¸à¸”</TableHead>
                <TableHead className="font-semibold text-foreground text-center">à¹‚à¸„à¸§à¸•à¸²à¸—à¸µà¸¡</TableHead>
                <TableHead className="font-semibold text-foreground text-right">à¸„à¹ˆà¸²à¸ªà¸¡à¸±à¸„à¸£</TableHead>
                <TableHead className="font-semibold text-foreground text-center">à¸ªà¸–à¸²à¸™à¸°</TableHead>
                <TableHead className="font-semibold text-foreground text-center">à¸§à¸±à¸™à¸—à¸µà¹ˆà¸›à¸´à¸”</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitions.map((comp) => (
                <TableRow key={comp.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{comp.name}</TableCell>
                  <TableCell className="text-muted-foreground">{comp.type}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{comp.maxPlayers}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{comp.maxAge}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{comp.teamQuota}</TableCell>
                  <TableCell className="text-right font-medium">à¸¿{comp.entryFee?.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={comp.status === "Open"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-red-500/10 text-red-500 border-red-500/30"
                      }
                    >
                      {comp.status === "Open" ? "à¹€à¸›à¸´à¸”à¸£à¸±à¸š" : "à¸›à¸´à¸”à¸£à¸±à¸š"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground text-sm">
                    {comp.endDate ? new Date(comp.endDate).toLocaleDateString("th-TH") : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => handleToggle(comp)}
                        title={comp.status === "Open" ? "à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£" : "à¹€à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£"}
                      >
                        {comp.status === "Open"
                          ? <ToggleRight size={18} className="text-emerald-500" />
                          : <ToggleLeft size={18} className="text-muted-foreground" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => openEdit(comp)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => handleDelete(comp)}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-card border-border/40">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editTarget ? "à¹à¸à¹‰à¹„à¸‚à¸£à¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™" : "à¹€à¸žà¸´à¹ˆà¸¡à¸£à¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¹ƒà¸«à¸¡à¹ˆ"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-2">
            <div className="space-y-1.5">
              <Label>à¸Šà¸·à¹ˆà¸­à¸£à¸²à¸¢à¸à¸²à¸£ <span className="text-red-500">*</span></Label>
              <Input
                placeholder="à¹€à¸Šà¹ˆà¸™ AM League Season 1"
                value={form.name || ""}
                onChange={(e) => field("name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>à¸›à¸£à¸°à¹€à¸ à¸—</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.type || "11 à¸„à¸™"}
                  onChange={(e) => field("type", e.target.value)}
                >
                  <option value="7 à¸„à¸™">7 à¸„à¸™</option>
                  <option value="11 à¸„à¸™">11 à¸„à¸™</option>
                  <option value="à¸­à¸·à¹ˆà¸™ à¹†">à¸­à¸·à¹ˆà¸™ à¹†</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>à¸ˆà¸³à¸™à¸§à¸™à¸œà¸¹à¹‰à¹€à¸¥à¹ˆà¸™/à¸—à¸µà¸¡</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxPlayers || ""}
                  onChange={(e) => field("maxPlayers", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>à¸ˆà¸³à¸à¸±à¸”à¸­à¸²à¸¢à¸¸à¸ªà¸¹à¸‡à¸ªà¸¸à¸”</Label>
                <Input
                  placeholder="à¹€à¸Šà¹ˆà¸™ 18 à¸«à¸£à¸·à¸­ à¹„à¸¡à¹ˆà¸ˆà¸³à¸à¸±à¸”"
                  value={form.maxAge || ""}
                  onChange={(e) => field("maxAge", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>à¸ˆà¸³à¸™à¸§à¸™à¸—à¸µà¸¡à¸—à¸µà¹ˆà¸£à¸±à¸š (Quota)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.teamQuota || ""}
                  onChange={(e) => field("teamQuota", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>à¸ˆà¸³à¸™à¸§à¸™à¸ªà¸²à¸¢</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.numberOfGroups || 4}
                  onChange={(e) => field("numberOfGroups", Number(e.target.value))}
                >
                  {[2,3,4,5,6,7,8].map((n) => (
                    <option key={n} value={n}>{n} à¸ªà¸²à¸¢</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>à¸—à¸µà¸¡à¸•à¹ˆà¸­à¸ªà¸²à¸¢</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.teamsPerGroup || 4}
                  onChange={(e) => field("teamsPerGroup", Number(e.target.value))}
                >
                  {[3,4,5,6].map((n) => (
                    <option key={n} value={n}>{n} à¸—à¸µà¸¡</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>à¸„à¹ˆà¸²à¸ªà¸¡à¸±à¸„à¸£ (à¸šà¸²à¸—)</Label>
              <Input
                type="number"
                min={0}
                value={form.entryFee || ""}
                onChange={(e) => field("entryFee", Number(e.target.value))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>à¸§à¸±à¸™à¸—à¸µà¹ˆà¹€à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£ <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={form.startDate || ""}
                  onChange={(e) => field("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>à¸§à¸±à¸™à¸—à¸µà¹ˆà¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£ <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={form.endDate || ""}
                  onChange={(e) => field("endDate", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>à¸ªà¸–à¸²à¸™à¸°</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.status || "Open"}
                onChange={(e) => field("status", e.target.value as "Open" | "Closed")}
              >
                <option value="Open">à¹€à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£</option>
                <option value="Closed">à¸›à¸´à¸”à¸£à¸±à¸šà¸ªà¸¡à¸±à¸„à¸£</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>à¸¢à¸à¹€à¸¥à¸´à¸</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary text-black hover:bg-primary/90">
              {saving ? "à¸à¸³à¸¥à¸±à¸‡à¸šà¸±à¸™à¸—à¸¶à¸..." : "à¸šà¸±à¸™à¸—à¸¶à¸"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

``n

## File: src/app/admin/clubs/page.tsx

`$lang
"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { updateClub, deleteClub } from "@/app/actions/admin/registrationActions";
import type { Club } from "@/types/club";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield, Search, Edit2, Loader2, Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminClubsPage() {
  const { user } = useAuth();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterZone, setFilterZone] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Edit dialog
  const [editing, setEditing] = useState<Club | null>(null);
  const [editForm, setEditForm] = useState({ playerCount: 0, status: "active" as "active" | "inactive" });
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Club | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClubs = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, "clubs"), orderBy("approvedAt", "desc")));
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Club));
      setClubs(data);
    } catch (error) {
      console.error("Error fetching clubs:", error);
      toast.error("à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹‚à¸«à¸¥à¸”à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¹‚à¸¡à¸ªà¸£à¹„à¸”à¹‰");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchClubs(); }, [fetchClubs]);

  const activeCount = clubs.filter((c) => c.status === "active").length;

  const filtered = clubs
    .filter((c) => filterStatus === "all" || c.status === filterStatus)
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // â”€â”€ Edit handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openEdit = (club: Club) => {
    setEditing(club);
    setEditForm({ playerCount: club.playerCount, status: club.status });
  };

  const handleSave = async () => {
    if (!editing || !user) return;
    setSaving(true);
    const res = await updateClub(user.id, editing.id, editForm);
    setSaving(false);
    if (res.success) {
      toast.success(res.message);
      setEditing(null);
      fetchClubs();
    } else {
      toast.error(res.message);
    }
  };

  // â”€â”€ Delete handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleDeleteClub = async () => {
    if (!deleteTarget || !user) return;
    setDeleting(true);
    const res = await deleteClub(user.id, deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    if (res.success) {
      toast.success(res.message);
      fetchClubs();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
            <Shield size={16} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">à¸ˆà¸±à¸”à¸à¸²à¸£à¸ªà¹‚à¸¡à¸ªà¸£</h1>
        </div>
        <p className="text-muted-foreground text-sm pl-11">à¸ªà¹‚à¸¡à¸ªà¸£à¸—à¸µà¹ˆà¸–à¸¹à¸à¸ªà¸£à¹‰à¸²à¸‡à¸ˆà¸²à¸à¸à¸²à¸£à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¸—à¸µà¸¡</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/40 bg-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
            <Shield size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{clubs.length}</p>
            <p className="text-muted-foreground text-sm">à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”</p>
          </div>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10">
            <Shield size={20} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-muted-foreground text-sm">Active</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="à¸„à¹‰à¸™à¸«à¸²à¸Šà¸·à¹ˆà¸­à¸ªà¹‚à¸¡à¸ªà¸£..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
        >
          <option value="all">à¸—à¸¸à¸à¸ªà¸–à¸²à¸™à¸°</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/40 overflow-hidden bg-card">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Shield size={28} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸ªà¹‚à¸¡à¸ªà¸£</p>
              <p className="text-muted-foreground text-sm mt-1">à¸ªà¹‚à¸¡à¸ªà¸£à¸ˆà¸°à¸–à¸¹à¸à¸ªà¸£à¹‰à¸²à¸‡à¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´à¹€à¸¡à¸·à¹ˆà¸­à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¸—à¸µà¸¡</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">à¸ªà¹‚à¸¡à¸ªà¸£</TableHead>
                <TableHead className="font-semibold text-foreground">à¸œà¸¹à¹‰à¸•à¸´à¸”à¸•à¹ˆà¸­</TableHead>
                <TableHead className="font-semibold text-foreground">à¹€à¸šà¸­à¸£à¹Œà¹‚à¸—à¸£</TableHead>
                <TableHead className="font-semibold text-foreground text-center">à¸œà¸¹à¹‰à¹€à¸¥à¹ˆà¸™</TableHead>
                <TableHead className="font-semibold text-foreground text-center">à¸ªà¸–à¸²à¸™à¸°</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((club) => (
                <TableRow key={club.id} className="border-border/40 hover:bg-muted/30" style={{ transition: "background-color 150ms" }}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {club.logo ? (
                        <img src={club.logo} alt={club.name} className="w-9 h-9 rounded-full object-cover border border-border/40" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {club.name?.slice(0, 2)}
                        </div>
                      )}
                      <span>{club.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{club.contactName}</TableCell>
                  <TableCell className="text-muted-foreground">{club.contactPhone}</TableCell>
                  <TableCell className="text-center font-semibold">{club.playerCount}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={club.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-zinc-500/10 text-zinc-500 border-zinc-500/30"
                      }
                    >
                      {club.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(club)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => setDeleteTarget(club)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* â”€â”€ Edit Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>à¹à¸à¹‰à¹„à¸‚à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¹‚à¸¡à¸ªà¸£</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-5 py-2">
              {/* Read-only info */}
              <div className="flex items-center gap-3">
                {editing.logo ? (
                  <img src={editing.logo} alt={editing.name} className="w-12 h-12 rounded-full object-cover border border-border/40" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold">
                    {editing.name?.slice(0, 2)}
                  </div>
                )}
                <div>
                  <p className="font-bold">{editing.name}</p>
                  <p className="text-xs text-muted-foreground">à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹à¸à¹‰à¸Šà¸·à¹ˆà¸­à¹à¸¥à¸°à¹‚à¸¥à¹‚à¸à¹‰à¸ˆà¸²à¸à¸«à¸™à¹‰à¸²à¸™à¸µà¹‰</p>
                </div>
              </div>

              {/* Editable fields */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">à¸ˆà¸³à¸™à¸§à¸™à¸œà¸¹à¹‰à¹€à¸¥à¹ˆà¸™</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.playerCount}
                  onChange={(e) => setEditForm({ ...editForm, playerCount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">à¸ªà¸–à¸²à¸™à¸°</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as "active" | "inactive" })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>à¸¢à¸à¹€à¸¥à¸´à¸</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              à¸šà¸±à¸™à¸—à¸¶à¸
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ Delete Confirm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>à¸¥à¸šà¸ªà¹‚à¸¡à¸ªà¸£ {deleteTarget?.name} à¸­à¸­à¸à¸ˆà¸²à¸à¸£à¸°à¸šà¸š?</AlertDialogTitle>
            <AlertDialogDescription>
              à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¸ˆà¸°à¸«à¸²à¸¢à¸–à¸²à¸§à¸£ à¸£à¸§à¸¡à¸–à¸¶à¸‡à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£, à¸œà¸¥à¹à¸šà¹ˆà¸‡à¸ªà¸²à¸¢ à¹à¸¥à¸°à¸œà¸¥à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¸—à¸µà¹ˆà¹€à¸à¸µà¹ˆà¸¢à¸§à¸‚à¹‰à¸­à¸‡
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>à¸¢à¸à¹€à¸¥à¸´à¸</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteClub}
              disabled={deleting}
            >
              {deleting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={14} className="mr-2" />}
              à¸¢à¸·à¸™à¸¢à¸±à¸™à¸¥à¸š
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

``n

## File: src/app/admin/schedule/page.tsx

`$lang
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  createMatch, updateMatchResult, updateMatchStatus,
  deleteMatch, getMatches, getGroupsForCompetition,
  getClubsByIds, getCompetitions,
} from "@/app/actions/admin/matchActions";
import type { Match } from "@/types/match";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  CalendarDays, Plus, Pencil, Trash2,
  Copy, Check, Loader2, Radio,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CompetitionItem { id: string; name: string; status: string; }
interface GroupItem { id: string; name: string; teamIds: string[]; }
interface ClubItem { id: string; name: string; logo: string; }

type MatchStatus = "scheduled" | "live" | "completed" | "postponed";

const STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: "à¸à¸³à¸«à¸™à¸”à¸à¸²à¸£", live: "à¸à¸³à¸¥à¸±à¸‡à¹à¸‚à¹ˆà¸‡",
  completed: "à¹€à¸ªà¸£à¹‡à¸ˆà¹à¸¥à¹‰à¸§", postponed: "à¹€à¸¥à¸·à¹ˆà¸­à¸™",
};
const STATUS_CLASS: Record<MatchStatus, string> = {
  scheduled: "bg-zinc-700 text-zinc-200",
  live: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40",
  completed: "bg-emerald-500/20 text-emerald-400",
  postponed: "bg-red-500/20 text-red-400",
};

function formatDate(ts: Timestamp | null): string {
  if (!ts) return "-";
  return ts.toDate().toLocaleString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminSchedulePage() {
  const { user } = useAuth();

  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createGroupId, setCreateGroupId] = useState("");
  const [createHome, setCreateHome] = useState("");
  const [createAway, setCreateAway] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createVenue, setCreateVenue] = useState("");
  const [creating, setCreating] = useState(false);

  // Result dialog
  const [resultMatch, setResultMatch] = useState<Match | null>(null);
  const [homeScore, setHomeScore] = useState("0");
  const [awayScore, setAwayScore] = useState("0");
  const [saving, setSaving] = useState(false);

  // Load competitions
  useEffect(() => {
    if (!user) return;
    getCompetitions(user.id).then((r) => {
      if (r.success) setCompetitions(r.competitions);
    });
  }, [user]);

  // Load groups when competition changes
  useEffect(() => {
    if (!user || !selectedComp) { setGroups([]); setSelectedGroup(""); return; }
    getGroupsForCompetition(user.id, selectedComp).then((r) => {
      if (r.success) setGroups(r.groups);
    });
  }, [user, selectedComp]);

  // Load clubs when groups change
  useEffect(() => {
    if (!user || groups.length === 0) { setClubs([]); return; }
    const allIds = [...new Set(groups.flatMap((g) => g.teamIds))];
    if (allIds.length === 0) return;
    getClubsByIds(user.id, allIds).then((r) => {
      if (r.success) setClubs(r.clubs);
    });
  }, [user, groups]);

  const loadMatches = useCallback(async () => {
    if (!user || !selectedComp) { setMatches([]); return; }
    setLoading(true);
    const r = await getMatches(user.id, selectedComp, selectedGroup || undefined);
    if (r.success) setMatches(r.matches);
    setLoading(false);
  }, [user, selectedComp, selectedGroup]);

  useEffect(() => { loadMatches(); }, [loadMatches]);

  const clubName = (id: string) => clubs.find((c) => c.id === id)?.name ?? id;
  const clubLogo = (id: string) => clubs.find((c) => c.id === id)?.logo ?? "";

  // Derived stats
  const totalMatches = matches.length;
  const completedMatches = matches.filter((m) => m.status === "completed").length;
  const scheduledMatches = matches.filter((m) => m.status === "scheduled").length;

  // â”€â”€ Create Match â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleCreate = async () => {
    if (!user) return;
    if (!createGroupId || !createHome || !createAway || !createDate || !createVenue.trim()) {
      toast.error("à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹ƒà¸«à¹‰à¸„à¸£à¸š"); return;
    }
    if (createHome === createAway) {
      toast.error("à¸—à¸µà¸¡à¹€à¸«à¸¢à¹‰à¸²à¹à¸¥à¸°à¸—à¸µà¸¡à¹€à¸¢à¸·à¸­à¸™à¸•à¹‰à¸­à¸‡à¹€à¸›à¹‡à¸™à¸„à¸™à¸¥à¸°à¸—à¸µà¸¡"); return;
    }
    setCreating(true);
    const dateTs = Timestamp.fromDate(new Date(createDate));
    const r = await createMatch(user.id, {
      competitionId: selectedComp,
      groupId: createGroupId,
      homeTeamId: createHome,
      awayTeamId: createAway,
      homeScore: 0,
      awayScore: 0,
      date: dateTs as unknown as import("firebase/firestore").Timestamp,
      venue: createVenue.trim(),
      status: "scheduled",
      round: "group",
    });
    setCreating(false);
    if (r.success) {
      toast.success(r.message);
      setCreateOpen(false);
      setCreateGroupId(""); setCreateHome(""); setCreateAway("");
      setCreateDate(""); setCreateVenue("");
      loadMatches();
    } else toast.error(r.message);
  };

  // â”€â”€ Save Result â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSaveResult = async () => {
    if (!user || !resultMatch) return;
    setSaving(true);
    const r = await updateMatchResult(
      user.id, resultMatch.id,
      parseInt(homeScore, 10), parseInt(awayScore, 10)
    );
    setSaving(false);
    if (r.success) {
      toast.success(r.message);
      setResultMatch(null);
      loadMatches();
    } else toast.error(r.message);
  };

  // â”€â”€ Change Status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleStatus = async (matchId: string, status: MatchStatus) => {
    if (!user) return;
    const r = await updateMatchStatus(user.id, matchId, status);
    if (r.success) { toast.success(r.message); loadMatches(); }
    else toast.error(r.message);
  };

  // â”€â”€ Delete â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleDelete = async (matchId: string) => {
    if (!user) return;
    if (!confirm("à¸¥à¸šà¹à¸¡à¸•à¸Šà¹Œà¸™à¸µà¹‰? à¸«à¸²à¸à¹à¸¡à¸•à¸Šà¹Œà¹€à¸ªà¸£à¹‡à¸ˆà¹à¸¥à¹‰à¸§ à¸ˆà¸°à¸„à¸³à¸™à¸§à¸“à¸„à¸°à¹à¸™à¸™à¹ƒà¸«à¸¡à¹ˆ")) return;
    const r = await deleteMatch(user.id, matchId);
    if (r.success) { toast.success(r.message); loadMatches(); }
    else toast.error(r.message);
  };

  // â”€â”€ Copy OBS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const copyOBS = (key: string, url: string) => {
    const full = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(full);
    setCopiedKey(key);
    toast.success("à¸„à¸±à¸”à¸¥à¸­à¸à¸¥à¸´à¸‡à¸à¹Œà¸ªà¸³à¹€à¸£à¹‡à¸ˆ");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Clubs available for the selected group in create dialog
  const groupClubs = groups
    .find((g) => g.id === createGroupId)
    ?.teamIds
    .map((id) => clubs.find((c) => c.id === id))
    .filter(Boolean) as ClubItem[] | undefined ?? [];

  return (
    <div className="space-y-8">
      {/* â”€â”€ Header â”€â”€ */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
            <CalendarDays size={16} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">à¸ˆà¸±à¸”à¸à¸²à¸£à¸•à¸²à¸£à¸²à¸‡à¹à¸‚à¹ˆà¸‡</h1>
        </div>
        <p className="text-muted-foreground text-sm pl-11">
          à¸ªà¸£à¹‰à¸²à¸‡à¹à¸¡à¸•à¸Šà¹Œ, à¸šà¸±à¸™à¸—à¸¶à¸à¸œà¸¥ à¹à¸¥à¸°à¸­à¸±à¸›à¹€à¸”à¸•à¸•à¸²à¸£à¸²à¸‡à¸„à¸°à¹à¸™à¸™à¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´
        </p>
      </div>

      {/* â”€â”€ Competition Filter â”€â”€ */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5 w-64">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">à¸£à¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™</Label>
          <Select value={selectedComp} onValueChange={(v) => { setSelectedComp(v ?? ""); setSelectedGroup(""); }}>
            <SelectTrigger>
              <SelectValue>
                {competitions.find((c) => c.id === selectedComp)?.name ?? "à¹€à¸¥à¸·à¸­à¸à¸£à¸²à¸¢à¸à¸²à¸£..."}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {competitions.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {groups.length > 0 && (
          <div className="space-y-1.5 w-40">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">à¸à¸£à¸­à¸‡à¸•à¸²à¸¡à¸ªà¸²à¸¢</Label>
            <Select value={selectedGroup} onValueChange={(v) => setSelectedGroup(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="à¸—à¸¸à¸à¸ªà¸²à¸¢" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">à¸—à¸¸à¸à¸ªà¸²à¸¢</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>à¸ªà¸²à¸¢ {g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          onClick={() => setCreateOpen(true)}
          disabled={!selectedComp}
          className="gap-2 ml-auto"
        >
          <Plus size={16} /> à¸ªà¸£à¹‰à¸²à¸‡à¹à¸¡à¸•à¸Šà¹Œ
        </Button>
      </div>

      {/* â”€â”€ Stats â”€â”€ */}
      {selectedComp && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "à¹à¸¡à¸•à¸Šà¹Œà¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”", value: totalMatches, color: "text-white" },
            { label: "à¹€à¸ªà¸£à¹‡à¸ˆà¹à¸¥à¹‰à¸§", value: completedMatches, color: "text-emerald-400" },
            { label: "à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¹à¸‚à¹ˆà¸‡", value: scheduledMatches, color: "text-zinc-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className={cn("text-3xl font-bold", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* â”€â”€ Matches Table â”€â”€ */}
      {selectedComp && (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>à¸§à¸±à¸™à¸—à¸µà¹ˆ</TableHead>
                <TableHead>à¸ªà¸²à¸¢</TableHead>
                <TableHead>à¸ªà¸™à¸²à¸¡</TableHead>
                <TableHead>à¸„à¸¹à¹ˆà¹à¸‚à¹ˆà¸‡</TableHead>
                <TableHead className="text-center">à¸ªà¸à¸­à¸£à¹Œ</TableHead>
                <TableHead>à¸ªà¸–à¸²à¸™à¸°</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : matches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¹à¸¡à¸•à¸Šà¹Œ â€” à¸à¸” "à¸ªà¸£à¹‰à¸²à¸‡à¹à¸¡à¸•à¸Šà¹Œ" à¹€à¸žà¸·à¹ˆà¸­à¹€à¸£à¸´à¹ˆà¸¡à¸•à¹‰à¸™
                  </TableCell>
                </TableRow>
              ) : (
                matches.map((match) => {
                  const groupName = groups.find((g) => g.id === match.groupId)?.name ?? "-";
                  return (
                    <TableRow key={match.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(match.date as unknown as Timestamp)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-yellow-400">à¸ªà¸²à¸¢ {groupName}</span>
                      </TableCell>
                      <TableCell className="text-sm">{match.venue || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          {clubLogo(match.homeTeamId) && (
                            <img src={clubLogo(match.homeTeamId)} className="w-5 h-5 rounded-full object-cover" alt="" />
                          )}
                          <span>{clubName(match.homeTeamId)}</span>
                          <span className="text-muted-foreground">vs</span>
                          {clubLogo(match.awayTeamId) && (
                            <img src={clubLogo(match.awayTeamId)} className="w-5 h-5 rounded-full object-cover" alt="" />
                          )}
                          <span>{clubName(match.awayTeamId)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {match.status === "completed"
                          ? `${match.homeScore} â€“ ${match.awayScore}`
                          : <span className="text-muted-foreground text-xs">-</span>
                        }
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", STATUS_CLASS[match.status])}>
                          {match.status === "live" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse mr-1.5 inline-block" />
                          )}
                          {STATUS_LABEL[match.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 px-2 text-xs gap-1"
                            onClick={() => {
                              setResultMatch(match);
                              setHomeScore(String(match.homeScore));
                              setAwayScore(String(match.awayScore));
                            }}
                          >
                            <Pencil size={12} /> à¸šà¸±à¸™à¸—à¸¶à¸à¸œà¸¥
                          </Button>
                          {match.status !== "live" ? (
                            <Button
                              size="sm" variant="ghost"
                              className="h-7 px-2 text-xs gap-1 text-yellow-400 hover:text-yellow-300"
                              onClick={() => handleStatus(match.id, "live")}
                            >
                              <Radio size={12} /> Live
                            </Button>
                          ) : (
                            <Button
                              size="sm" variant="ghost"
                              className="h-7 px-2 text-xs gap-1 text-muted-foreground"
                              onClick={() => handleStatus(match.id, "scheduled")}
                            >
                              à¸«à¸¢à¸¸à¸” Live
                            </Button>
                          )}
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 px-2 text-red-400 hover:text-red-300"
                            onClick={() => handleDelete(match.id)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* â”€â”€ OBS Links â”€â”€ */}
      {selectedComp && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            OBS Browser Source Links
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: "schedule", label: "à¸•à¸²à¸£à¸²à¸‡à¹à¸‚à¹ˆà¸‡à¸§à¸±à¸™à¸™à¸µà¹‰", path: `/overlay/schedule?competition=${selectedComp}` },
              { key: "standings", label: "à¸•à¸²à¸£à¸²à¸‡à¸„à¸°à¹à¸™à¸™ (à¸ªà¸²à¸¢ A)", path: `/overlay/standings?competition=${selectedComp}&group=A` },
              { key: "results", label: "à¸œà¸¥ 5 à¹à¸¡à¸•à¸Šà¹Œà¸¥à¹ˆà¸²à¸ªà¸¸à¸”", path: `/overlay/results?competition=${selectedComp}` },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => copyOBS(item.key, item.path)}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background hover:bg-muted/40 px-4 py-3 text-left"
                style={{ transition: "background-color 150ms" }}
              >
                <div>
                  <p className="text-xs font-semibold text-white">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{item.path.slice(0, 40)}</p>
                </div>
                {copiedKey === item.key
                  ? <Check size={14} className="text-emerald-400 shrink-0" />
                  : <Copy size={14} className="text-muted-foreground shrink-0" />
                }
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            ðŸ’¡ à¹ƒà¸™ OBS: <strong>Sources â†’ Browser Source</strong> â†’ à¸§à¸²à¸‡ URL â†’ à¸•à¸±à¹‰à¸‡ Width: 1920, Height: 1080
          </p>
        </div>
      )}

      {/* â”€â”€ Create Match Dialog â”€â”€ */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>à¸ªà¸£à¹‰à¸²à¸‡à¹à¸¡à¸•à¸Šà¹Œà¹ƒà¸«à¸¡à¹ˆ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>à¸ªà¸²à¸¢</Label>
              <Select value={createGroupId} onValueChange={(v) => { setCreateGroupId(v ?? ""); setCreateHome(""); setCreateAway(""); }}>
                <SelectTrigger><SelectValue placeholder="à¹€à¸¥à¸·à¸­à¸à¸ªà¸²à¸¢..." /></SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>à¸ªà¸²à¸¢ {g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>à¸—à¸µà¸¡à¹€à¸«à¸¢à¹‰à¸²</Label>
                <Select value={createHome} onValueChange={(v) => setCreateHome(v ?? "")} disabled={!createGroupId}>
                  <SelectTrigger><SelectValue placeholder="à¹€à¸¥à¸·à¸­à¸à¸—à¸µà¸¡..." /></SelectTrigger>
                  <SelectContent>
                    {groupClubs.map((c) => (
                      <SelectItem key={c.id} value={c.id} disabled={c.id === createAway}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>à¸—à¸µà¸¡à¹€à¸¢à¸·à¸­à¸™</Label>
                <Select value={createAway} onValueChange={(v) => setCreateAway(v ?? "")} disabled={!createGroupId}>
                  <SelectTrigger><SelectValue placeholder="à¹€à¸¥à¸·à¸­à¸à¸—à¸µà¸¡..." /></SelectTrigger>
                  <SelectContent>
                    {groupClubs.map((c) => (
                      <SelectItem key={c.id} value={c.id} disabled={c.id === createHome}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>à¸§à¸±à¸™à¸—à¸µà¹ˆà¹à¸¥à¸°à¹€à¸§à¸¥à¸²</Label>
              <Input type="datetime-local" value={createDate} onChange={(e) => setCreateDate(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>à¸ªà¸™à¸²à¸¡</Label>
              <Input
                placeholder="à¸Šà¸·à¹ˆà¸­à¸ªà¸™à¸²à¸¡..."
                value={createVenue}
                onChange={(e) => setCreateVenue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>à¸¢à¸à¹€à¸¥à¸´à¸</Button>
            <Button onClick={handleCreate} disabled={creating} className="gap-2">
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              à¸ªà¸£à¹‰à¸²à¸‡à¹à¸¡à¸•à¸Šà¹Œ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ Record Result Dialog â”€â”€ */}
      <Dialog open={!!resultMatch} onOpenChange={(o) => { if (!o) setResultMatch(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>à¸šà¸±à¸™à¸—à¸¶à¸à¸œà¸¥à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡</DialogTitle>
          </DialogHeader>
          {resultMatch && (
            <div className="space-y-6 py-2">
              <div className="flex items-center justify-center gap-6 text-sm font-bold">
                <div className="text-center flex-1">
                  {clubLogo(resultMatch.homeTeamId) && (
                    <img src={clubLogo(resultMatch.homeTeamId)} className="w-10 h-10 rounded-full mx-auto mb-1 object-cover" alt="" />
                  )}
                  <p className="leading-tight">{clubName(resultMatch.homeTeamId)}</p>
                </div>
                <span className="text-muted-foreground text-xs">VS</span>
                <div className="text-center flex-1">
                  {clubLogo(resultMatch.awayTeamId) && (
                    <img src={clubLogo(resultMatch.awayTeamId)} className="w-10 h-10 rounded-full mx-auto mb-1 object-cover" alt="" />
                  )}
                  <p className="leading-tight">{clubName(resultMatch.awayTeamId)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">à¸ªà¸à¸­à¸£à¹Œà¹€à¸«à¸¢à¹‰à¸²</Label>
                  <Input
                    type="number" min={0}
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="text-center text-2xl font-bold h-14"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">à¸ªà¸à¸­à¸£à¹Œà¹€à¸¢à¸·à¸­à¸™</Label>
                  <Input
                    type="number" min={0}
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="text-center text-2xl font-bold h-14"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResultMatch(null)}>à¸¢à¸à¹€à¸¥à¸´à¸</Button>
            <Button onClick={handleSaveResult} disabled={saving} className="gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              à¸šà¸±à¸™à¸—à¸¶à¸à¸œà¸¥
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

``n

## File: src/app/admin/bracket/page.tsx

`$lang
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCompetitions, getClubsByIds } from "@/app/actions/admin/matchActions";
import {
  generateBracket,
  getBracketMatches,
  updateBracketResult,
  updateBracketStatus,
} from "@/app/actions/admin/bracketActions";
import type { BracketMatch } from "@/types/bracket";
import type { Club } from "@/types/club";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Swords, Tv, Copy, Loader2, PlayCircle, StopCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminBracketPage() {
  const { user } = useAuth();

  const [competitions, setCompetitions] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompId, setSelectedCompId] = useState("");
  const [matches, setMatches] = useState<BracketMatch[]>([]);
  const [clubsMap, setClubsMap] = useState<Record<string, Club>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Score editing
  const [editingMatch, setEditingMatch] = useState<BracketMatch | null>(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [savingScore, setSavingScore] = useState(false);

  useEffect(() => {
    async function loadComps() {
      if (!user) return;
      const res = await getCompetitions(user.id);
      setCompetitions(res.competitions || []);
      if (res.competitions && res.competitions.length > 0) {
        setSelectedCompId(res.competitions[0].id);
      } else {
        setLoading(false);
      }
    }
    loadComps();
  }, [user]);

  const fetchBracketData = useCallback(async () => {
    if (!selectedCompId) return;
    setLoading(true);
    try {
      const data = await getBracketMatches(selectedCompId);
      setMatches(data);

      // Collect all unique team IDs to fetch clubs
      const teamIds = new Set<string>();
      data.forEach((m) => {
        if (m.homeTeamId) teamIds.add(m.homeTeamId);
        if (m.awayTeamId) teamIds.add(m.awayTeamId);
      });

      if (teamIds.size > 0 && user) {
        const res = await getClubsByIds(user.id, Array.from(teamIds));
        const map: Record<string, Club> = {};
        res.clubs?.forEach((c: any) => (map[c.id] = c));
        setClubsMap(map);
      }
    } catch (error) {
      toast.error("à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ Bracket à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ");
    } finally {
      setLoading(false);
    }
  }, [selectedCompId]);

  useEffect(() => {
    fetchBracketData();
  }, [fetchBracketData]);

  const handleGenerate = async () => {
    if (!user || !selectedCompId) return;
    setGenerating(true);
    const res = await generateBracket(user.id, selectedCompId);
    setGenerating(false);
    if (res.success) {
      toast.success(res.message);
      fetchBracketData();
    } else {
      toast.error(res.message);
    }
  };

  const handleSaveScore = async () => {
    if (!user || !editingMatch) return;
    if (homeScore === awayScore) {
      toast.error("à¸£à¸­à¸šà¸™à¹‡à¸­à¸à¹€à¸­à¸²à¸•à¹Œà¸•à¹‰à¸­à¸‡à¸¡à¸µà¸œà¸¹à¹‰à¸Šà¸™à¸° (à¸«à¹‰à¸²à¸¡à¹€à¸ªà¸¡à¸­)");
      return;
    }
    setSavingScore(true);
    const res = await updateBracketResult(user.id, editingMatch.id, homeScore, awayScore);
    setSavingScore(false);
    if (res.success) {
      toast.success(res.message);
      setEditingMatch(null);
      fetchBracketData();
    } else {
      toast.error(res.message);
    }
  };

  const toggleMatchStatus = async (match: BracketMatch) => {
    if (!user) return;
    const newStatus = match.status === "live" ? "completed" : "live";
    const res = await updateBracketStatus(user.id, match.id, newStatus);
    if (res.success) {
      toast.success(`à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¸ªà¸–à¸²à¸™à¸°à¹€à¸›à¹‡à¸™ ${newStatus.toUpperCase()}`);
      fetchBracketData();
    } else {
      toast.error(res.message);
    }
  };

  const getClub = (id: string) => clubsMap[id];

  // Group matches by round for visual rendering
  const rounds = useMemo(() => {
    const map = new Map<number, BracketMatch[]>();
    matches.forEach((m) => {
      const arr = map.get(m.round) || [];
      arr.push(m);
      map.set(m.round, arr);
    });
    // Sort rounds
    const sortedRounds = Array.from(map.keys()).sort((a, b) => a - b);
    return sortedRounds.map((r) => map.get(r)!);
  }, [matches]);

  const copyOverlayUrl = () => {
    const url = `${window.location.origin}/overlay/bracket?competition=${selectedCompId}`;
    navigator.clipboard.writeText(url);
    toast.success("à¸„à¸±à¸”à¸¥à¸­à¸ OBS URL à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢");
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#facc15]/20 rounded-md flex items-center justify-center">
              <Swords size={18} className="text-[#facc15]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">à¸ˆà¸±à¸”à¸à¸²à¸£à¸£à¸­à¸šà¸™à¹‡à¸­à¸à¹€à¸­à¸²à¸•à¹Œ</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-11">
            à¸ªà¸£à¹‰à¸²à¸‡à¸ªà¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´à¹à¸¥à¸°à¸šà¸±à¸™à¸—à¸¶à¸à¸œà¸¥
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[200px]"
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
          >
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {selectedCompId && (
            <AlertDialog>
              <AlertDialogTrigger 
                render={
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
                    <RefreshCw size={15} /> à¸ªà¸£à¹‰à¸²à¸‡ Bracket à¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸ªà¸£à¹‰à¸²à¸‡à¸ªà¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¹ƒà¸«à¸¡à¹ˆ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    à¸£à¸°à¸šà¸šà¸ˆà¸°à¸”à¸¶à¸‡à¸­à¸±à¸™à¸”à¸±à¸š 1-2 à¸ˆà¸²à¸à¸—à¸¸à¸à¸à¸¥à¸¸à¹ˆà¸¡à¸¡à¸²à¸ˆà¸±à¸šà¸„à¸¹à¹ˆà¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´à¹à¸šà¸šà¹„à¸‚à¸§à¹‰ (Cross)
                    <br />
                    <span className="text-red-500 font-semibold mt-2 block">
                      à¸„à¸³à¹€à¸•à¸·à¸­à¸™: à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ Bracket à¸‚à¸­à¸‡à¸£à¸²à¸¢à¸à¸²à¸£à¸™à¸µà¹‰à¸—à¸µà¹ˆà¸¡à¸µà¸­à¸¢à¸¹à¹ˆà¹€à¸”à¸´à¸¡ (à¸–à¹‰à¸²à¸¡à¸µ) à¸ˆà¸°à¸–à¸¹à¸à¸¥à¸šà¸—à¸´à¹‰à¸‡à¸–à¸²à¸§à¸£
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={generating}>à¸¢à¸à¹€à¸¥à¸´à¸</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-[#facc15] hover:bg-[#eab308] text-black font-semibold"
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    {generating ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                    à¸¢à¸·à¸™à¸¢à¸±à¸™à¸ªà¸£à¹‰à¸²à¸‡à¹ƒà¸«à¸¡à¹ˆ
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* OBS Section */}
      <div className="rounded-xl border border-border/40 bg-card p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Tv size={20} className="text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">OBS Bracket Overlay</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browser Source 1920x1080 (à¹‚à¸›à¸£à¹ˆà¸‡à¹ƒà¸ªà¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´)
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={copyOverlayUrl} className="gap-2 shrink-0">
          <Copy size={14} /> à¸„à¸±à¸”à¸¥à¸­à¸ URL
        </Button>
      </div>

      {/* Bracket Board */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-[80%]" />
            <Skeleton className="h-24 w-[60%]" />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Swords size={28} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸ªà¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™</p>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                à¸à¸”à¸›à¸¸à¹ˆà¸¡ "à¸ªà¸£à¹‰à¸²à¸‡ Bracket à¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´" à¸”à¹‰à¸²à¸™à¸šà¸™ à¹€à¸žà¸·à¹ˆà¸­à¸”à¸¶à¸‡à¸—à¸µà¸¡à¸—à¸µà¹ˆà¸œà¹ˆà¸²à¸™à¹€à¸‚à¹‰à¸²à¸£à¸­à¸šà¸¡à¸²à¸ˆà¸±à¸”à¸ªà¸²à¸¢à¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 overflow-x-auto custom-scrollbar">
            <div className="flex gap-12 min-w-max">
              {rounds.map((roundMatches, roundIndex) => (
                <div
                  key={roundIndex}
                  className="flex flex-col justify-around gap-6 w-[320px] relative"
                >
                  {/* Round Header */}
                  <div className="absolute -top-12 left-0 right-0 text-center font-bold text-muted-foreground uppercase tracking-widest text-sm">
                    {roundMatches[0].roundName === "F" ? (
                      <span className="text-[#facc15] flex items-center justify-center gap-2">
                        <Trophy size={16} /> FINAL
                      </span>
                    ) : (
                      roundMatches[0].roundName
                    )}
                  </div>

                  {roundMatches.map((match) => {
                    const home = getClub(match.homeTeamId);
                    const away = getClub(match.awayTeamId);
                    const isCompleted = match.status === "completed";
                    const hasResult = isCompleted && match.winnerId !== "";

                    const homeWon = hasResult && match.winnerId === match.homeTeamId;
                    const awayWon = hasResult && match.winnerId === match.awayTeamId;

                    return (
                      <div
                        key={match.id}
                        className="relative bg-background border border-border/50 rounded-lg shadow-sm hover:border-border transition-colors group"
                      >
                        {/* Live Badge */}
                        {match.status === "live" && (
                          <div className="absolute -top-2.5 -right-2.5 z-10">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                          </div>
                        )}

                        {/* Match Layout */}
                        <div className="flex flex-col">
                          {/* Home Team */}
                          <div
                            className={`flex items-center justify-between p-3 border-b border-border/30 ${
                              hasResult && !homeWon ? "opacity-50 grayscale" : ""
                            } ${homeWon ? "bg-[#facc15]/10" : ""}`}
                          >
                            <div className="flex items-center gap-2">
                              {home?.logo ? (
                                <img
                                  src={home.logo}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-muted rounded-full" />
                              )}
                              <span className={`text-sm font-semibold truncate max-w-[150px] ${homeWon ? "text-[#facc15]" : ""}`}>
                                {home?.name || "TBD"}
                              </span>
                            </div>
                            <span className={`font-bold ${homeWon ? "text-[#facc15]" : ""}`}>
                              {isCompleted || match.status === "live" ? match.homeScore : "-"}
                            </span>
                          </div>

                          {/* Away Team */}
                          <div
                            className={`flex items-center justify-between p-3 ${
                              hasResult && !awayWon ? "opacity-50 grayscale" : ""
                            } ${awayWon ? "bg-[#facc15]/10" : ""}`}
                          >
                            <div className="flex items-center gap-2">
                              {away?.logo ? (
                                <img
                                  src={away.logo}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-muted rounded-full" />
                              )}
                              <span className={`text-sm font-semibold truncate max-w-[150px] ${awayWon ? "text-[#facc15]" : ""}`}>
                                {away?.name || "TBD"}
                              </span>
                            </div>
                            <span className={`font-bold ${awayWon ? "text-[#facc15]" : ""}`}>
                              {isCompleted || match.status === "live" ? match.awayScore : "-"}
                            </span>
                          </div>
                        </div>

                        {/* Admin Actions Overlay (Shows on Hover) */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          {match.homeTeamId && match.awayTeamId && (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="w-3/4 h-8 text-xs font-semibold"
                                onClick={() => {
                                  setEditingMatch(match);
                                  setHomeScore(match.homeScore);
                                  setAwayScore(match.awayScore);
                                }}
                              >
                                {isCompleted ? "à¹à¸à¹‰à¹„à¸‚à¸œà¸¥à¸ªà¸à¸­à¸£à¹Œ" : "à¸šà¸±à¸™à¸—à¸¶à¸à¸œà¸¥"}
                              </Button>

                              <Button
                                size="sm"
                                variant={match.status === "live" ? "destructive" : "default"}
                                className="w-3/4 h-8 text-xs gap-1"
                                onClick={() => toggleMatchStatus(match)}
                              >
                                {match.status === "live" ? (
                                  <>
                                    <StopCircle size={14} /> à¸›à¸´à¸” Live
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle size={14} /> à¸•à¸±à¹‰à¸‡ Live
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                          {(!match.homeTeamId || !match.awayTeamId) && (
                            <span className="text-white/80 text-xs font-medium px-4 text-center">
                              à¸£à¸­à¸œà¸¹à¹‰à¸Šà¸™à¸°à¸ˆà¸²à¸à¸£à¸­à¸šà¸—à¸µà¹ˆà¹à¸¥à¹‰à¸§
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Champion Column */}
              <div className="flex flex-col justify-center items-center w-[200px] pl-8">
                {(() => {
                  const finalMatch = rounds[rounds.length - 1]?.[0];
                  if (finalMatch && finalMatch.status === "completed" && finalMatch.winnerId) {
                    const champ = getClub(finalMatch.winnerId);
                    return (
                      <div className="flex flex-col items-center animate-in zoom-in duration-500">
                        <Trophy size={64} className="text-[#facc15] mb-4 drop-shadow-lg" />
                        {champ?.logo && (
                          <img
                            src={champ.logo}
                            alt=""
                            className="w-20 h-20 rounded-full object-cover border-4 border-[#facc15] mb-3 shadow-xl"
                          />
                        )}
                        <span className="text-xl font-bold text-center text-[#facc15]">
                          {champ?.name}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground mt-1 tracking-widest uppercase">
                          Champion
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-col items-center opacity-20 grayscale">
                      <Trophy size={64} className="mb-4" />
                      <span className="font-bold">CHAMPION</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* â”€â”€ Score Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={!!editingMatch} onOpenChange={() => setEditingMatch(null)}>
        <DialogContent className="max-w-md bg-card border-border/40">
          <DialogHeader>
            <DialogTitle>à¸šà¸±à¸™à¸—à¸¶à¸à¸œà¸¥à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™ (à¸™à¹‡à¸­à¸à¹€à¸­à¸²à¸•à¹Œ)</DialogTitle>
          </DialogHeader>

          {editingMatch && (
            <div className="py-6 flex items-center justify-between gap-4">
              {/* Home */}
              <div className="flex flex-col items-center gap-3 w-[120px]">
                {getClub(editingMatch.homeTeamId)?.logo ? (
                  <img
                    src={getClub(editingMatch.homeTeamId).logo}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover border border-border/40"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted" />
                )}
                <span className="text-sm font-bold text-center truncate w-full">
                  {getClub(editingMatch.homeTeamId)?.name}
                </span>
                <Input
                  type="number"
                  min={0}
                  className="text-center text-2xl h-14 font-bold"
                  value={homeScore}
                  onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                />
              </div>

              <span className="text-2xl font-bold text-muted-foreground">-</span>

              {/* Away */}
              <div className="flex flex-col items-center gap-3 w-[120px]">
                {getClub(editingMatch.awayTeamId)?.logo ? (
                  <img
                    src={getClub(editingMatch.awayTeamId).logo}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover border border-border/40"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted" />
                )}
                <span className="text-sm font-bold text-center truncate w-full">
                  {getClub(editingMatch.awayTeamId)?.name}
                </span>
                <Input
                  type="number"
                  min={0}
                  className="text-center text-2xl h-14 font-bold"
                  value={awayScore}
                  onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMatch(null)} disabled={savingScore}>
              à¸¢à¸à¹€à¸¥à¸´à¸
            </Button>
            <Button
              className="bg-[#facc15] hover:bg-[#eab308] text-black font-semibold"
              onClick={handleSaveScore}
              disabled={savingScore}
            >
              {savingScore ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              à¸šà¸±à¸™à¸—à¸¶à¸à¹à¸¥à¸°à¹€à¸¥à¸·à¹ˆà¸­à¸™à¸£à¸­à¸š
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

``n

## File: src/app/admin/news/page.tsx

`$lang
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getNews,
  createNews,
  updateNews,
  deleteNews,
  publishNews,
} from "@/app/actions/admin/newsActions";
import type { News } from "@/types/news";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ImageUpload from "@/components/ui/ImageUpload";
import {
  Newspaper,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Eye,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminNewsPage() {
  const { user } = useAuth();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCat, setFilterCat] = useState<"all" | "news" | "highlight">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"news" | "highlight">("news");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNewsList = useCallback(async () => {
    setLoading(true);
    try {
      // Pass status/category if explicitly requested, but since we have client-side search too,
      // it's often easier to fetch all (or a large batch) and filter client-side for admin panels,
      // or pass exact filters. Let's pass exact filters if not 'all'.
      const fStatus = filterStatus === "all" ? undefined : filterStatus;
      const fCat = filterCat === "all" ? undefined : filterCat;

      const data = await getNews(fStatus, fCat, 100);
      setNewsList(data);
    } catch (error) {
      toast.error("à¸”à¸¶à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸‚à¹ˆà¸²à¸§à¸ªà¸²à¸£à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCat]);

  useEffect(() => {
    fetchNewsList();
  }, [fetchNewsList]);

  // Derived stats
  const totalNews = newsList.length;
  const publishedNews = newsList.filter((n) => n.status === "published").length;
  const draftNews = newsList.filter((n) => n.status === "draft").length;

  const filteredNews = newsList.filter(
    (n) => n.title.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingId(null);
    setTitle("");
    setCategory("news");
    setCoverImage("");
    setContent("");
    setVideoUrl("");
    setIsPublished(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (news: News) => {
    setEditingId(news.id);
    setTitle(news.title);
    setCategory(news.category);
    setCoverImage(news.coverImage);
    setContent(news.content);
    setVideoUrl(news.videoUrl || "");
    setIsPublished(news.status === "published");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!title.trim() || !coverImage) {
      toast.error("à¸à¸£à¸¸à¸“à¸²à¸à¸£à¸­à¸à¸«à¸±à¸§à¸‚à¹‰à¸­à¹à¸¥à¸°à¸­à¸±à¸›à¹‚à¸«à¸¥à¸”à¸ à¸²à¸žà¸›à¸");
      return;
    }

    setSaving(true);
    const data = {
      title,
      category,
      coverImage,
      content,
      videoUrl: videoUrl || undefined,
      status: isPublished ? ("published" as const) : ("draft" as const),
      authorId: user.id,
      authorName: "Admin", // Or fetch user name
    };

    let res;
    if (editingId) {
      res = await updateNews(user.id, editingId, data);
    } else {
      res = await createNews(user.id, data);
    }

    setSaving(false);
    if (res.success) {
      toast.success(res.message);
      setIsDialogOpen(false);
      fetchNewsList();
    } else {
      toast.error(res.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    const res = await deleteNews(user.id, id);
    setDeletingId(null);
    if (res.success) {
      toast.success(res.message);
      fetchNewsList();
    } else {
      toast.error(res.message);
    }
  };

  const handlePublish = async (id: string) => {
    if (!user) return;
    const res = await publishNews(user.id, id);
    if (res.success) {
      toast.success(res.message);
      fetchNewsList();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#facc15]/20 rounded-md flex items-center justify-center">
              <Newspaper size={18} className="text-[#facc15]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">à¸ˆà¸±à¸”à¸à¸²à¸£à¸‚à¹ˆà¸²à¸§à¸ªà¸²à¸£ & à¹„à¸®à¹„à¸¥à¸•à¹Œ</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-11">
            à¸ªà¸£à¹‰à¸²à¸‡à¹à¸¥à¸°à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆà¸„à¸­à¸™à¹€à¸—à¸™à¸•à¹Œà¹ƒà¸«à¹‰à¸œà¸¹à¹‰à¸•à¸´à¸”à¸•à¸²à¸¡
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-[#facc15] hover:bg-[#eab308] text-black font-semibold gap-2">
          <Plus size={18} /> à¸ªà¸£à¹‰à¸²à¸‡à¹€à¸™à¸·à¹‰à¸­à¸«à¸²à¹ƒà¸«à¸¡à¹ˆ
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/50 bg-card p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”</p>
            <h3 className="text-3xl font-bold">{totalNews}</h3>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-500">
            <Eye size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆà¹à¸¥à¹‰à¸§</p>
            <h3 className="text-3xl font-bold">{publishedNews}</h3>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
            <Pencil size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">à¸‰à¸šà¸±à¸šà¸£à¹ˆà¸²à¸‡ (Draft)</p>
            <h3 className="text-3xl font-bold">{draftNews}</h3>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 items-center bg-muted/20">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="à¸„à¹‰à¸™à¸«à¸²à¸«à¸±à¸§à¸‚à¹‰à¸­à¸‚à¹ˆà¸²à¸§..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value as any)}
            >
              <option value="all">à¸—à¸¸à¸à¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆ</option>
              <option value="news">à¸‚à¹ˆà¸²à¸§à¸ªà¸²à¸£</option>
              <option value="highlight">à¸§à¸´à¸”à¸µà¹‚à¸­à¹„à¸®à¹„à¸¥à¸•à¹Œ</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">à¸—à¸¸à¸à¸ªà¸–à¸²à¸™à¸°</option>
              <option value="published">à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆà¹à¸¥à¹‰à¸§</option>
              <option value="draft">à¸‰à¸šà¸±à¸šà¸£à¹ˆà¸²à¸‡</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground">
            à¹„à¸¡à¹ˆà¸žà¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸‚à¹ˆà¸²à¸§à¸ªà¸²à¸£à¸—à¸µà¹ˆà¸„à¹‰à¸™à¸«à¸²
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="border-b border-border text-muted-foreground text-[11px] uppercase tracking-wider text-left">
                  <th className="py-4 px-6 font-medium">à¸ à¸²à¸žà¸›à¸</th>
                  <th className="py-4 px-6 font-medium">à¸«à¸±à¸§à¸‚à¹‰à¸­à¸‚à¹ˆà¸²à¸§</th>
                  <th className="py-4 px-6 font-medium">à¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆ</th>
                  <th className="py-4 px-6 font-medium">à¸ªà¸–à¸²à¸™à¸°</th>
                  <th className="py-4 px-6 font-medium">à¸§à¸±à¸™à¸—à¸µà¹ˆà¸ªà¸£à¹‰à¸²à¸‡</th>
                  <th className="py-4 px-6 font-medium text-right">à¸ˆà¸±à¸”à¸à¸²à¸£</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredNews.map((n) => (
                  <tr key={n.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-6 w-[120px]">
                      <div className="w-20 h-12 bg-muted rounded-md overflow-hidden relative">
                        {n.coverImage ? (
                          <img src={n.coverImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">No img</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6 font-medium max-w-[300px] truncate">
                      {n.title}
                    </td>
                    <td className="py-3 px-6">
                      <Badge variant="outline" className={n.category === "highlight" ? "border-purple-500 text-purple-500" : ""}>
                        {n.category === "highlight" ? "à¹„à¸®à¹„à¸¥à¸•à¹Œ" : "à¸‚à¹ˆà¸²à¸§à¸ªà¸²à¸£"}
                      </Badge>
                    </td>
                    <td className="py-3 px-6">
                      {n.status === "published" ? (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-transparent">à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆà¹à¸¥à¹‰à¸§</Badge>
                      ) : (
                        <Badge variant="secondary">à¸‰à¸šà¸±à¸šà¸£à¹ˆà¸²à¸‡</Badge>
                      )}
                    </td>
                    <td className="py-3 px-6 text-muted-foreground">
                      {new Date(n.publishedAt as string).toLocaleDateString("th-TH")}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {n.status === "draft" && (
                          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => handlePublish(n.id)}>
                            <Eye size={14} /> à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆ
                          </Button>
                        )}
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEditDialog(n)}>
                          <Pencil size={14} />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger render={
                            <Button size="icon" variant="destructive" className="h-8 w-8">
                              <Trash2 size={14} />
                            </Button>
                          } />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>à¸¢à¸·à¸™à¸¢à¸±à¸™à¸à¸²à¸£à¸¥à¸šà¸‚à¹ˆà¸²à¸§?</AlertDialogTitle>
                              <AlertDialogDescription>
                                à¸à¸²à¸£à¸¥à¸š "{n.title}" à¸ˆà¸°à¸—à¸³à¹ƒà¸«à¹‰à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸«à¸²à¸¢à¹„à¸›à¸­à¸¢à¹ˆà¸²à¸‡à¸–à¸²à¸§à¸£ à¸£à¸§à¸¡à¸–à¸¶à¸‡à¸£à¸¹à¸›à¸ à¸²à¸žà¸›à¸£à¸°à¸à¸­à¸šà¸”à¹‰à¸§à¸¢
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>à¸¢à¸à¹€à¸¥à¸´à¸</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive hover:bg-destructive/90 text-white"
                                onClick={() => handleDelete(n.id)}
                              >
                                {deletingId === n.id ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                                à¸¢à¸·à¸™à¸¢à¸±à¸™à¸¥à¸š
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* â”€â”€ Create / Edit Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border/40">
          <DialogHeader>
            <DialogTitle>{editingId ? "à¹à¸à¹‰à¹„à¸‚à¹€à¸™à¸·à¹‰à¸­à¸«à¸²" : "à¸ªà¸£à¹‰à¸²à¸‡à¹€à¸™à¸·à¹‰à¸­à¸«à¸²à¹ƒà¸«à¸¡à¹ˆ"}</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label>à¸«à¸±à¸§à¸‚à¹‰à¸­à¸‚à¹ˆà¸²à¸§ <span className="text-red-500">*</span></Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="à¸žà¸´à¸¡à¸žà¹Œà¸«à¸±à¸§à¸‚à¹‰à¸­à¸‚à¹ˆà¸²à¸§à¸—à¸µà¹ˆà¸™à¸µà¹ˆ..." />
              </div>
              <div className="space-y-2">
                <Label>à¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆ</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="news">à¸‚à¹ˆà¸²à¸§à¸ªà¸²à¸£</option>
                  <option value="highlight">à¹„à¸®à¹„à¸¥à¸•à¹Œà¸§à¸´à¸”à¸µà¹‚à¸­</option>
                </select>
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label>à¸ à¸²à¸žà¸›à¸ (Cover Image) <span className="text-red-500">*</span></Label>
              <div className="bg-muted/20 border border-border border-dashed rounded-lg p-2">
                <ImageUpload 
                  value={coverImage} 
                  onUpload={setCoverImage} 
                  folder="news" 
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>à¹€à¸™à¸·à¹‰à¸­à¸«à¸²</Label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={content} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} 
                rows={6}
                placeholder="à¹€à¸‚à¸µà¸¢à¸™à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¹€à¸™à¸·à¹‰à¸­à¸«à¸²à¸—à¸µà¹ˆà¸™à¸µà¹ˆ..."
              />
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label>URL à¸§à¸´à¸”à¸µà¹‚à¸­ (YouTube / Facebook) <span className="text-muted-foreground font-normal ml-2">(à¹„à¸¡à¹ˆà¸šà¸±à¸‡à¸„à¸±à¸š)</span></Label>
              <Input 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
              <div>
                <Label className="text-base">à¸ªà¸–à¸²à¸™à¸°à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆ</Label>
                <p className="text-sm text-muted-foreground">à¹€à¸›à¸´à¸”à¹€à¸žà¸·à¹ˆà¸­à¹à¸ªà¸”à¸‡à¸šà¸™à¸«à¸™à¹‰à¸²à¹€à¸§à¹‡à¸šà¸ªà¸²à¸˜à¸²à¸£à¸“à¸°à¸—à¸±à¸™à¸—à¸µ</p>
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[120px]"
                value={isPublished ? "published" : "draft"}
                onChange={(e) => setIsPublished(e.target.value === "published")}
              >
                <option value="draft">à¸‰à¸šà¸±à¸šà¸£à¹ˆà¸²à¸‡</option>
                <option value="published">à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆ</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              à¸¢à¸à¹€à¸¥à¸´à¸
            </Button>
            <Button 
              className="bg-[#facc15] hover:bg-[#eab308] text-black font-semibold" 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              à¸šà¸±à¸™à¸—à¸¶à¸à¸‚à¹‰à¸­à¸¡à¸¹à¸¥
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

``n

## File: src/app/page.tsx

`$lang
import Link from "next/link";
import { DataService } from "@/services/dataService";
import HeroSection from "@/components/HeroSection";
import WorksSection from "@/components/WorksSection";

export default async function Home() {
  const albums = await DataService.getGalleryAlbums();
  const allMatches = await DataService.getMatches();
  const upcomingMatches = allMatches.filter(m => m.status === "upcoming").slice(0, 4);

  return (
    <div>
      {/* â”€â”€â”€ Hero â”€â”€â”€ */}
      <HeroSection />

      {/* â”€â”€â”€ Works / Portfolio â”€â”€â”€ */}
      <WorksSection />

      {/* â”€â”€â”€ Upcoming Matches â”€â”€â”€ */}
      <section className="py-24 px-6 bg-card border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-xl font-semibold text-foreground">à¸™à¸±à¸”à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¸—à¸µà¹ˆà¸ˆà¸°à¸¡à¸²</h2>
            <Link href="/schedule" className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide">
              à¸•à¸²à¸£à¸²à¸‡à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” â†’
            </Link>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="py-12 border border-dashed border-border/60 rounded-sm text-center">
              <p className="text-sm text-muted-foreground">à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸à¸³à¸«à¸™à¸”à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¹ƒà¸™à¸‚à¸“à¸°à¸™à¸µà¹‰</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {upcomingMatches.map((m, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto_1fr] items-center py-5 gap-4 hover:bg-muted/20 px-4 -mx-4 transition-colors rounded-sm"
                >
                  {/* Home */}
                  <p className="text-sm font-medium text-foreground text-right">{m.home || m.teamA}</p>

                  {/* Center: date + time */}
                  <div className="text-center px-6">
                    <p className="text-[11px] text-muted-foreground mb-0.5">{m.date}</p>
                    <p className="text-sm font-bold text-foreground tabular-nums">{m.time || "TBD"}</p>
                  </div>

                  {/* Away */}
                  <p className="text-sm font-medium text-foreground">{m.away || m.teamB}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* â”€â”€â”€ Featured Gallery â”€â”€â”€ */}
      {albums.length > 0 && (
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-xl font-semibold text-foreground">à¹à¸à¸¥à¹€à¸¥à¸­à¸£à¸µà¹ˆà¹€à¸”à¹ˆà¸™</h2>
              <Link href="/gallery" className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide">
                à¸”à¸¹à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” â†’
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {albums.slice(0, 4).map((album) => (
                <Link
                  key={album.albumId}
                  href={`/gallery/${album.albumId}`}
                  className="group relative aspect-square overflow-hidden rounded-sm bg-muted block"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.04] transition-transform duration-500"
                    style={{ backgroundImage: `url('${album.coverUrl}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-xs font-medium line-clamp-1">{album.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* â”€â”€â”€ CTA Banner â”€â”€â”€ */}
      <section className="py-20 px-6 bg-card border-t border-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">à¸šà¸±à¸™à¸—à¸¶à¸à¸—à¸¸à¸à¸Šà¹‡à¸­à¸•à¸ªà¸³à¸„à¸±à¸à¸‚à¸­à¸‡à¸—à¸µà¸¡</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            à¸‹à¸·à¹‰à¸­à¸ à¸²à¸žà¸–à¹ˆà¸²à¸¢à¸„à¸§à¸²à¸¡à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¸ªà¸¹à¸‡ à¹„à¸£à¹‰à¸¥à¸²à¸¢à¸™à¹‰à¸³ à¸«à¸£à¸·à¸­à¸ˆà¸­à¸‡à¸Šà¹ˆà¸²à¸‡à¸ à¸²à¸žà¸¡à¸·à¸­à¸­à¸²à¸Šà¸µà¸žà¸ªà¸³à¸«à¸£à¸±à¸šà¸—à¸µà¸¡à¸‚à¸­à¸‡à¸„à¸¸à¸“à¸•à¸¥à¸­à¸”à¸—à¸±à¹‰à¸‡à¸¤à¸”à¸¹à¸à¸²à¸¥
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/shop" className="px-6 py-3 bg-foreground text-background text-sm font-semibold rounded-sm hover:opacity-85 transition-opacity">
              à¸ªà¸±à¹ˆà¸‡à¸‹à¸·à¹‰à¸­à¸ªà¸´à¸™à¸„à¹‰à¸²
            </Link>
            <Link href="/team-package" className="px-6 py-3 border border-border text-foreground text-sm font-semibold rounded-sm hover:border-foreground/60 transition-colors">
              à¸ˆà¸­à¸‡à¸Šà¹ˆà¸²à¸‡à¸ à¸²à¸ž
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

``n

## File: src/app/teams/page.tsx

`$lang
"use client";

import { useEffect, useState } from "react";
import { Users, MapPin, Award } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import type { Club } from "@/types/club";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "clubs"),
      where("status", "==", "active"),
      orderBy("name", "asc")
    )

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Club[]
      setTeams(data)
      setLoading(false)
    }, (err) => {
      console.error("getTeams error:", err)
      setLoading(false)
    })

    return () => unsub()
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-background pb-32 animate-in fade-in duration-700">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-6">
        <div className="space-y-2">
          <Badge variant="outline" className="px-4 py-1 border-primary/40 text-primary font-bold tracking-[0.3em] uppercase text-[10px]">
            The Contenders
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">à¸ªà¹‚à¸¡à¸ªà¸£à¸—à¸µà¹ˆà¹€à¸‚à¹‰à¸²à¸£à¹ˆà¸§à¸¡à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-base md:text-lg leading-relaxed">
          à¸—à¸³à¸„à¸§à¸²à¸¡à¸£à¸¹à¹‰à¸ˆà¸±à¸à¸ªà¹‚à¸¡à¸ªà¸£à¸Ÿà¸¸à¸•à¸šà¸­à¸¥à¸Šà¸±à¹‰à¸™à¸™à¸³à¸—à¸µà¹ˆà¹€à¸‚à¹‰à¸²à¸£à¹ˆà¸§à¸¡à¸›à¸£à¸°à¸Šà¸±à¸™à¸Šà¸±à¸¢à¹ƒà¸™ AM Tournament à¸¤à¸”à¸¹à¸à¸²à¸¥ 2026 à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸›à¸£à¸°à¸§à¸±à¸•à¸´ à¸ªà¸±à¸‡à¸à¸±à¸” à¹à¸¥à¸°à¸ªà¸–à¸´à¸•à¸´à¸—à¸µà¹ˆà¸™à¹ˆà¸²à¸ªà¸™à¹ƒà¸ˆ
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <Separator className="bg-border/20 mb-16" />
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-sm" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="py-24 border-2 border-dashed border-border/40 rounded-sm text-center flex flex-col items-center justify-center space-y-4">
            <Users className="text-muted-foreground opacity-20" size={48} />
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¹‚à¸¡à¸ªà¸£à¹ƒà¸™à¸‚à¸“à¸°à¸™à¸µà¹‰</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team) => (
              <Card key={team.id} className="group border-border/40 hover:border-primary/40 transition-all duration-400 shadow-sm hover:shadow-lg hover:shadow-primary/5 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-5">
                    {/* Real Team Logo */}
                    {team.logo ? (
                      <img 
                        src={team.logo} 
                        alt={team.name} 
                        className="w-16 h-16 rounded-xl object-cover border border-border/50 shadow-sm group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-muted/50 border border-border/40 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-500">
                        <Users size={24} className="text-muted-foreground/50" />
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300 line-clamp-1">
                        {team.name}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                        <MapPin size={12} className="text-primary/70" /> -
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mt-1">
                        <Award size={12} className="text-primary/70" /> AM Tournament
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex flex-col flex-1 pb-4">
                   <div className="mt-auto grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
                      <div className="space-y-0.5 border-r border-border/50 px-1">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1">
                          à¸œà¸¹à¹‰à¸ˆà¸±à¸”à¸à¸²à¸£à¸—à¸µà¸¡
                        </p>
                        <p className="text-[13px] font-bold text-foreground line-clamp-1">{team.contactName || 'à¹„à¸¡à¹ˆà¸£à¸°à¸šà¸¸'}</p>
                      </div>
                      <div className="space-y-0.5 px-2">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1">
                          Since
                        </p>
                        <p className="text-[13px] font-bold text-foreground">{team.approvedAt && (team.approvedAt as any).toDate ? (team.approvedAt as any).toDate().getFullYear() : new Date().getFullYear()}</p>
                      </div>
                   </div>
                </CardContent>

                <CardFooter className="bg-muted/10 py-3 flex justify-between items-center px-6 border-t border-border/20">
                   <Badge variant="outline" className="text-[9px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                      Official Team
                   </Badge>
                   <span className="text-[10px] text-muted-foreground font-semibold">AM VERIFIED</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 flex justify-center opacity-40">
         <p className="text-[10px] uppercase tracking-[0.5em] font-bold">Quality // Excellence // Community</p>
      </div>
    </div>
  );
}

``n

## File: src/app/draw/page.tsx

`$lang
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection, query, where, orderBy, onSnapshot, getDocs,
} from "firebase/firestore";
import type { Club } from "@/types/club";
import type { CompetitionForDraw, Group } from "@/types/tournament";
import GroupCard from "@/components/public/GroupCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DrawPublicPage() {
  const [competitions, setCompetitions] = useState<CompetitionForDraw[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch all competitions
  useEffect(() => {
    const fetchCompetitions = async () => {
      const snap = await getDocs(
        query(collection(db, "competitions"), orderBy("createdAt", "desc"))
      );
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CompetitionForDraw));
      setCompetitions(list);
      if (list.length > 0) setActiveId(list[0].id);
      if (list.length === 0) setLoading(false);
    };
    fetchCompetitions();
  }, []);

  // 2. Listen to groups + clubs for active tournament
  useEffect(() => {
    if (!activeId) return;

    const unsubGroups = onSnapshot(
      query(collection(db, "groups"), where("competitionId", "==", activeId)),
      (snap) => {
        setGroups(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() } as Group))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      }
    );

    const unsubClubs = onSnapshot(
      query(collection(db, "clubs"), where("status", "==", "active")),
      (snap) => {
        setClubs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Club)));
        setLoading(false);
      }
    );

    return () => {
      unsubGroups();
      unsubClubs();
    };
  }, [activeId]);

  // Helper
  const getGroupClubs = (group: Group): Club[] =>
    group.teamIds
      .map((id) => clubs.find((c) => c.id === id))
      .filter(Boolean) as Club[];

  const activeCompetition = competitions.find((c) => c.id === activeId);

  const gridCols = groups.length <= 2
    ? "md:grid-cols-2"
    : groups.length <= 3
      ? "md:grid-cols-3"
      : "md:grid-cols-2 lg:grid-cols-4";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 md:py-20">
      <div className="container max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold font-kanit tracking-tight text-zinc-900 dark:text-white">
            à¸œà¸¥à¸à¸²à¸£à¹à¸šà¹ˆà¸‡à¸ªà¸²à¸¢
          </h1>
          {activeCompetition && (
            <div className="flex items-center justify-center gap-3">
              <Trophy size={18} className="text-[#facc15]" />
              <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                {activeCompetition.name}
              </span>
            </div>
          )}
        </div>

        {/* Competition Tabs */}
        {competitions.length > 1 && (
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {competitions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setActiveId(c.id); setLoading(true); }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border",
                  activeId === c.id
                    ? "bg-[#facc15] text-black border-[#facc15]"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-[#facc15]/50"
                )}
                style={{ transition: "all 200ms" }}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border bg-white dark:bg-zinc-900 p-6 space-y-4">
                <Skeleton className="h-8 w-24" />
                {[...Array(4)].map((__, j) => <Skeleton key={j} className="h-10 w-full" />)}
              </div>
            ))}
          </div>
        ) : groups.length === 0 || groups.every((g) => g.teamIds.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <Trophy size={36} className="text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold font-kanit text-zinc-900 dark:text-white mb-2">à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¹„à¸”à¹‰à¹à¸šà¹ˆà¸‡à¸ªà¸²à¸¢</h3>
            <p className="text-muted-foreground">à¸œà¸¥à¸à¸²à¸£à¹à¸šà¹ˆà¸‡à¸ªà¸²à¸¢à¸ˆà¸°à¹à¸ªà¸”à¸‡à¸—à¸µà¹ˆà¸™à¸µà¹ˆà¹€à¸¡à¸·à¹ˆà¸­à¹à¸­à¸”à¸¡à¸´à¸™à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                groupName={group.name}
                clubs={getGroupClubs(group)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

``n

## File: src/app/schedule/page.tsx

`$lang
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection, query, where, orderBy, onSnapshot, getDocs, limit,
} from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CompItem { id: string; name: string; }
interface GroupItem { id: string; name: string; teamIds: string[]; }
interface ClubMap { [id: string]: { name: string; logo: string }; }

interface MatchItem {
  id: string;
  competitionId: string;
  groupId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: { toDate: () => Date } | null;
  venue: string;
  status: "scheduled" | "live" | "completed" | "postponed";
}

type TabKey = "upcoming" | "results";

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function fmtDate(ts: { toDate: () => Date } | null): string {
  if (!ts) return "-";
  return ts.toDate().toLocaleString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function statusBadge(s: MatchItem["status"]) {
  const map: Record<MatchItem["status"], { label: string; cls: string }> = {
    scheduled: { label: "à¸à¸³à¸«à¸™à¸”à¸à¸²à¸£", cls: "bg-zinc-700/60 text-zinc-300" },
    live: { label: "à¸à¸³à¸¥à¸±à¸‡à¹à¸‚à¹ˆà¸‡", cls: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40" },
    completed: { label: "à¹€à¸ªà¸£à¹‡à¸ˆà¸ªà¸´à¹‰à¸™", cls: "bg-emerald-500/20 text-emerald-400" },
    postponed: { label: "à¹€à¸¥à¸·à¹ˆà¸­à¸™", cls: "bg-red-500/20 text-red-400" },
  };
  const { label, cls } = map[s];
  return (
    <Badge className={cn("text-[10px] font-semibold", cls)}>
      {s === "live" && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse mr-1 inline-block" />}
      {label}
    </Badge>
  );
}

// â”€â”€â”€ Match Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MatchCard({ match, clubs, groupName }: {
  match: MatchItem;
  clubs: ClubMap;
  groupName: string;
}) {
  const home = clubs[match.homeTeamId] ?? { name: match.homeTeamId, logo: "" };
  const away = clubs[match.awayTeamId] ?? { name: match.awayTeamId, logo: "" };

  return (
    <div
      className="rounded-xl border border-border/60 bg-card hover:border-border hover:bg-muted/30 p-6"
      style={{ transition: "border-color 200ms, background-color 200ms" }}
    >
      {/* Top row: group + status */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
          à¸ªà¸²à¸¢ {groupName}
        </span>
        {statusBadge(match.status)}
      </div>

      {/* Teams */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Home */}
        <div className="flex flex-col items-center gap-2 text-center">
          {home.logo ? (
            <img src={home.logo} alt={home.name} className="w-12 h-12 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {home.name.slice(0, 2)}
            </div>
          )}
          <p className="text-sm font-semibold text-foreground leading-tight">{home.name}</p>
        </div>

        {/* Center */}
        <div className="text-center px-2">
          {match.status === "completed" ? (
            <p className="text-2xl font-bold text-foreground tabular-nums tracking-wider">
              {match.homeScore} â€“ {match.awayScore}
            </p>
          ) : (
            <div className="bg-background border border-border px-4 py-1.5 rounded-md">
              <p className="text-lg font-bold text-foreground">VS</p>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-2 text-center">
          {away.logo ? (
            <img src={away.logo} alt={away.name} className="w-12 h-12 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {away.name.slice(0, 2)}
            </div>
          )}
          <p className="text-sm font-semibold text-foreground leading-tight">{away.name}</p>
        </div>
      </div>

      {/* Bottom: date + venue */}
      <div className="flex items-center justify-center gap-4 mt-5 text-xs text-muted-foreground">
        <span>{fmtDate(match.date)}</span>
        {match.venue && (
          <>
            <span className="w-px h-3 bg-border" />
            <span>{match.venue}</span>
          </>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ Main Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ScheduleContent() {
  const searchParams = useSearchParams();
  const compParam = searchParams.get("competition");

  const [competitions, setCompetitions] = useState<CompItem[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [clubs, setClubs] = useState<ClubMap>({});
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("upcoming");

  // Load competitions
  useEffect(() => {
    const q = query(collection(db, "competitions"), orderBy("createdAt", "desc"));
    getDocs(q).then((snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, name: d.data().name as string }));
      setCompetitions(list);
      if (compParam && list.some((c) => c.id === compParam)) {
        setSelectedComp(compParam);
      } else if (list.length > 0) {
        setSelectedComp(list[0].id);
      }
      setLoading(false);
    });
  }, [compParam]);

  // Load groups for selected competition
  useEffect(() => {
    if (!selectedComp) { setGroups([]); return; }
    const q = query(collection(db, "groups"), where("competitionId", "==", selectedComp));
    getDocs(q).then((snap) => {
      setGroups(
        snap.docs
          .map((d) => ({ id: d.id, name: d.data().name as string, teamIds: (d.data().teamIds as string[]) ?? [] }))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    });
  }, [selectedComp]);

  // Load clubs from groups
  useEffect(() => {
    if (groups.length === 0) { setClubs({}); return; }
    const allIds = [...new Set(groups.flatMap((g) => g.teamIds))];
    if (allIds.length === 0) return;

    const chunks: string[][] = [];
    for (let i = 0; i < allIds.length; i += 30) {
      chunks.push(allIds.slice(i, i + 30));
    }

    Promise.all(
      chunks.map((chunk) =>
        getDocs(query(collection(db, "clubs"), where("__name__", "in", chunk)))
      )
    ).then((results) => {
      const map: ClubMap = {};
      results.forEach((snap) => {
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.status === "active") {
            map[d.id] = { name: (data.name as string) ?? "", logo: (data.logo as string) ?? "" };
          }
        });
      });
      setClubs(map);
    });
  }, [groups]);

  // Real-time matches
  useEffect(() => {
    if (!selectedComp) { setMatches([]); return; }

    let q = query(
      collection(db, "matches"),
      where("competitionId", "==", selectedComp),
      orderBy("date", "asc")
    );

    if (selectedGroup) {
      q = query(
        collection(db, "matches"),
        where("competitionId", "==", selectedComp),
        where("groupId", "==", selectedGroup),
        orderBy("date", "asc")
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      setMatches(snap.docs.map((d) => ({ id: d.id, ...d.data() } as MatchItem)));
    });

    return () => unsub();
  }, [selectedComp, selectedGroup]);

  // Filter by tab
  const filtered = matches.filter((m) => {
    if (tab === "upcoming") return m.status === "scheduled" || m.status === "live";
    return m.status === "completed";
  });

  const groupName = (gid: string) => groups.find((g) => g.id === gid)?.name ?? "-";

  return (
    <div className="pt-16 min-h-screen bg-background">
      {/* â”€â”€ Header â”€â”€ */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          Match Fixtures
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-4">à¸•à¸²à¸£à¸²à¸‡à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          à¸•à¸´à¸”à¸•à¸²à¸¡à¹‚à¸›à¸£à¹à¸à¸£à¸¡à¸™à¸±à¸”à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¹à¸¥à¸°à¸œà¸¥à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸­à¸‡à¸—à¸¸à¸à¸—à¸µà¸¡ à¹à¸šà¸šà¹€à¸£à¸µà¸¢à¸¥à¹„à¸—à¸¡à¹Œ
        </p>
      </div>

      <div className="border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="animate-spin text-primary mb-4" size={32} />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* â”€â”€ Filters â”€â”€ */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Competition selector */}
                {competitions.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {competitions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelectedComp(c.id); setSelectedGroup(""); }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold border",
                          "transition-all duration-200",
                          selectedComp === c.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Group filter */}
                {groups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedGroup("")}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-medium",
                        "transition-all duration-200",
                        !selectedGroup
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      à¸—à¸¸à¸à¸ªà¸²à¸¢
                    </button>
                    {groups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGroup(g.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-medium",
                          "transition-all duration-200",
                          selectedGroup === g.id
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        à¸ªà¸²à¸¢ {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* â”€â”€ Tabs â”€â”€ */}
              <div className="flex gap-1 bg-muted/40 p-1 rounded-lg w-fit">
                {([
                  { key: "upcoming" as TabKey, label: "à¸•à¸²à¸£à¸²à¸‡à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™" },
                  { key: "results" as TabKey, label: "à¸œà¸¥à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡" },
                ]).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-semibold",
                      "transition-all duration-200",
                      tab === t.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* â”€â”€ Match List â”€â”€ */}
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <CalendarDays size={40} className="text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {tab === "upcoming" ? "à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸à¸³à¸«à¸™à¸”à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™" : "à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸œà¸¥à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      clubs={clubs}
                      groupName={groupName(m.groupId)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pb-32" />
    </div>
  );
}

// â”€â”€â”€ Page Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <ScheduleContent />
    </Suspense>
  );
}

``n

## File: src/app/results/page.tsx

`$lang
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection, query, where, orderBy, onSnapshot, getDocs,
} from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CompItem { id: string; name: string; }
interface GroupItem { id: string; name: string; teamIds: string[]; }
interface ClubMap { [id: string]: { name: string; logo: string }; }

interface MatchItem {
  id: string;
  competitionId: string;
  groupId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: { toDate: () => Date } | null;
  venue: string;
  status: "scheduled" | "live" | "completed" | "postponed";
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function fmtDate(ts: { toDate: () => Date } | null): string {
  if (!ts) return "-";
  return ts.toDate().toLocaleString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// â”€â”€â”€ Match Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MatchCard({ match, clubs, groupName }: {
  match: MatchItem;
  clubs: ClubMap;
  groupName: string;
}) {
  const home = clubs[match.homeTeamId] ?? { name: match.homeTeamId, logo: "" };
  const away = clubs[match.awayTeamId] ?? { name: match.awayTeamId, logo: "" };

  return (
    <div
      className="rounded-xl border border-border/60 bg-card hover:border-border hover:bg-muted/30 p-6"
      style={{ transition: "border-color 200ms, background-color 200ms" }}
    >
      {/* Top row: group + status */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
          à¸ªà¸²à¸¢ {groupName}
        </span>
        <Badge className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
          à¹€à¸ªà¸£à¹‡à¸ˆà¸ªà¸´à¹‰à¸™
        </Badge>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Home */}
        <div className="flex flex-col items-center gap-2 text-center">
          {home.logo ? (
            <img src={home.logo} alt={home.name} className="w-12 h-12 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {home.name.slice(0, 2)}
            </div>
          )}
          <p className="text-sm font-semibold text-foreground leading-tight">{home.name}</p>
        </div>

        {/* Center */}
        <div className="text-center px-2">
          <p className="text-2xl font-bold text-foreground tabular-nums tracking-wider">
            {match.homeScore} â€“ {match.awayScore}
          </p>
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-2 text-center">
          {away.logo ? (
            <img src={away.logo} alt={away.name} className="w-12 h-12 rounded-full object-cover border border-border" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {away.name.slice(0, 2)}
            </div>
          )}
          <p className="text-sm font-semibold text-foreground leading-tight">{away.name}</p>
        </div>
      </div>

      {/* Bottom: date + venue */}
      <div className="flex items-center justify-center gap-4 mt-5 text-xs text-muted-foreground">
        <span>{fmtDate(match.date)}</span>
        {match.venue && (
          <>
            <span className="w-px h-3 bg-border" />
            <span>{match.venue}</span>
          </>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ Main Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ResultsContent() {
  const searchParams = useSearchParams();
  const compParam = searchParams.get("competition");

  const [competitions, setCompetitions] = useState<CompItem[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [clubs, setClubs] = useState<ClubMap>({});
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load competitions
  useEffect(() => {
    const q = query(collection(db, "competitions"), orderBy("createdAt", "desc"));
    getDocs(q).then((snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, name: d.data().name as string }));
      setCompetitions(list);
      if (compParam && list.some((c) => c.id === compParam)) {
        setSelectedComp(compParam);
      } else if (list.length > 0) {
        setSelectedComp(list[0].id);
      }
      setLoading(false);
    });
  }, [compParam]);

  // Load groups for selected competition
  useEffect(() => {
    if (!selectedComp) { setGroups([]); return; }
    const q = query(collection(db, "groups"), where("competitionId", "==", selectedComp));
    getDocs(q).then((snap) => {
      setGroups(
        snap.docs
          .map((d) => ({ id: d.id, name: d.data().name as string, teamIds: (d.data().teamIds as string[]) ?? [] }))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    });
  }, [selectedComp]);

  // Load clubs from groups
  useEffect(() => {
    if (groups.length === 0) { setClubs({}); return; }
    const allIds = [...new Set(groups.flatMap((g) => g.teamIds))];
    if (allIds.length === 0) return;

    const chunks: string[][] = [];
    for (let i = 0; i < allIds.length; i += 30) {
      chunks.push(allIds.slice(i, i + 30));
    }

    Promise.all(
      chunks.map((chunk) =>
        getDocs(query(collection(db, "clubs"), where("__name__", "in", chunk)))
      )
    ).then((results) => {
      const map: ClubMap = {};
      results.forEach((snap) => {
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.status === "active") {
            map[d.id] = { name: (data.name as string) ?? "", logo: (data.logo as string) ?? "" };
          }
        });
      });
      setClubs(map);
    });
  }, [groups]);

  // Real-time matches (filter 'completed' locally to avoid index errors)
  useEffect(() => {
    if (!selectedComp) { setMatches([]); return; }

    let q = query(
      collection(db, "matches"),
      where("competitionId", "==", selectedComp),
      orderBy("date", "asc")
    );

    if (selectedGroup) {
      q = query(
        collection(db, "matches"),
        where("competitionId", "==", selectedComp),
        where("groupId", "==", selectedGroup),
        orderBy("date", "asc")
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      const allMatches = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MatchItem));
      // Filter ONLY completed matches
      const completedMatches = allMatches.filter((m) => m.status === "completed");
      setMatches(completedMatches);
    });

    return () => unsub();
  }, [selectedComp, selectedGroup]);

  const groupName = (gid: string) => groups.find((g) => g.id === gid)?.name ?? "-";

  return (
    <div className="pt-16 min-h-screen bg-background">
      {/* â”€â”€ Header â”€â”€ */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          Match Results
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-4">à¸œà¸¥à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          à¸ªà¸£à¸¸à¸›à¸œà¸¥à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¸—à¸µà¹ˆà¹€à¸ªà¸£à¹‡à¸ˆà¸ªà¸´à¹‰à¸™à¹à¸¥à¹‰à¸§à¸‚à¸­à¸‡à¹à¸•à¹ˆà¸¥à¸°à¸ªà¸²à¸¢ à¹à¸šà¸šà¹€à¸£à¸µà¸¢à¸¥à¹„à¸—à¸¡à¹Œ
        </p>
      </div>

      <div className="border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="animate-spin text-primary mb-4" size={32} />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* â”€â”€ Filters â”€â”€ */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Competition selector */}
                {competitions.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {competitions.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelectedComp(c.id); setSelectedGroup(""); }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-semibold border",
                          "transition-all duration-200",
                          selectedComp === c.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Group filter */}
                {groups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedGroup("")}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-medium",
                        "transition-all duration-200",
                        !selectedGroup
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      à¸—à¸¸à¸à¸ªà¸²à¸¢
                    </button>
                    {groups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGroup(g.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-[11px] font-medium",
                          "transition-all duration-200",
                          selectedGroup === g.id
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        à¸ªà¸²à¸¢ {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* â”€â”€ Match List â”€â”€ */}
              {matches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/40 rounded-2xl bg-card/20">
                  <Trophy size={48} className="text-muted-foreground/30 mb-4" />
                  <p className="text-base font-bold text-foreground">à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸œà¸¥à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    à¸œà¸¥à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¸—à¸µà¹ˆà¸ˆà¸šà¹à¸¥à¹‰à¸§à¸ˆà¸°à¹à¸ªà¸”à¸‡à¸—à¸µà¹ˆà¸™à¸µà¹ˆ
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      clubs={clubs}
                      groupName={groupName(m.groupId)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pb-32" />
    </div>
  );
}

// â”€â”€â”€ Page Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}

``n

## File: src/app/standings/page.tsx

`$lang
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection, query, where, orderBy, onSnapshot, getDocs,
} from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CompItem { id: string; name: string; }
interface GroupItem { id: string; name: string; teamIds: string[]; }
interface ClubMap { [id: string]: { name: string; logo: string }; }

interface StandingRow {
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

// â”€â”€â”€ Main Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StandingsContent() {
  const searchParams = useSearchParams();
  const compParam = searchParams.get("competition");

  const [competitions, setCompetitions] = useState<CompItem[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [clubs, setClubs] = useState<ClubMap>({});
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Load competitions
  useEffect(() => {
    const q = query(collection(db, "competitions"), orderBy("createdAt", "desc"));
    getDocs(q).then((snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, name: d.data().name as string }));
      setCompetitions(list);
      if (compParam && list.some((c) => c.id === compParam)) {
        setSelectedComp(compParam);
      } else if (list.length > 0) {
        setSelectedComp(list[0].id);
      }
      setLoading(false);
    });
  }, [compParam]);

  // Load groups
  useEffect(() => {
    if (!selectedComp) { setGroups([]); return; }
    const q = query(collection(db, "groups"), where("competitionId", "==", selectedComp));
    getDocs(q).then((snap) => {
      const g = snap.docs
        .map((d) => ({ id: d.id, name: d.data().name as string, teamIds: (d.data().teamIds as string[]) ?? [] }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setGroups(g);
      if (g.length > 0) setSelectedGroup(g[0].id);
    });
  }, [selectedComp]);

  // Load clubs
  useEffect(() => {
    if (groups.length === 0) { setClubs({}); return; }
    const allIds = [...new Set(groups.flatMap((g) => g.teamIds))];
    if (allIds.length === 0) return;

    const chunks: string[][] = [];
    for (let i = 0; i < allIds.length; i += 30) {
      chunks.push(allIds.slice(i, i + 30));
    }

    Promise.all(
      chunks.map((chunk) =>
        getDocs(query(collection(db, "clubs"), where("__name__", "in", chunk)))
      )
    ).then((results) => {
      const map: ClubMap = {};
      results.forEach((snap) => {
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.status === "active") {
            map[d.id] = { name: (data.name as string) ?? "", logo: (data.logo as string) ?? "" };
          }
        });
      });
      setClubs(map);
    });
  }, [groups]);

  // Real-time standings
  useEffect(() => {
    if (!selectedComp || !selectedGroup) { setStandings([]); return; }

    const q = query(
      collection(db, "standings"),
      where("competitionId", "==", selectedComp),
      where("groupId", "==", selectedGroup)
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows: StandingRow[] = snap.docs.map((d) => ({
        clubId: d.data().clubId as string,
        played: (d.data().played as number) ?? 0,
        won: (d.data().won as number) ?? 0,
        drawn: (d.data().drawn as number) ?? 0,
        lost: (d.data().lost as number) ?? 0,
        goalsFor: (d.data().goalsFor as number) ?? 0,
        goalsAgainst: (d.data().goalsAgainst as number) ?? 0,
        goalDiff: (d.data().goalDiff as number) ?? 0,
        points: (d.data().points as number) ?? 0,
      }));

      rows.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        return b.goalsFor - a.goalsFor;
      });

      setStandings(rows);
    });

    return () => unsub();
  }, [selectedComp, selectedGroup]);

  const activeGroupName = groups.find((g) => g.id === selectedGroup)?.name ?? "";

  return (
    <div className="pt-16 min-h-screen bg-background">
      {/* â”€â”€ Header â”€â”€ */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          League Table
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-4">à¸•à¸²à¸£à¸²à¸‡à¸„à¸°à¹à¸™à¸™</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          à¸­à¸±à¸™à¸”à¸±à¸šà¸„à¸°à¹à¸™à¸™à¸ªà¸°à¸ªà¸¡à¸‚à¸­à¸‡à¸—à¸¸à¸à¸—à¸µà¸¡à¹ƒà¸™à¹à¸•à¹ˆà¸¥à¸°à¸ªà¸²à¸¢ à¹à¸šà¸šà¹€à¸£à¸µà¸¢à¸¥à¹„à¸—à¸¡à¹Œ
        </p>
      </div>

      <div className="border-t border-border/40">
        <div className="max-w-5xl mx-auto px-6 py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="animate-spin text-primary mb-4" size={32} />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* â”€â”€ Competition Selector â”€â”€ */}
              {competitions.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {competitions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setSelectedComp(c.id); setSelectedGroup(""); }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold border",
                        "transition-all duration-200",
                        selectedComp === c.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              {/* â”€â”€ Group Tabs â”€â”€ */}
              {groups.length > 0 && (
                <div className="flex gap-1 bg-muted/40 p-1 rounded-lg w-fit">
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGroup(g.id)}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm font-semibold",
                        "transition-all duration-200",
                        selectedGroup === g.id
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      à¸ªà¸²à¸¢ {g.name}
                    </button>
                  ))}
                </div>
              )}

              {/* â”€â”€ Standings Table â”€â”€ */}
              {selectedGroup && (
                <div className="rounded-xl border border-border overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-muted/30 px-6 py-3 border-b border-border flex items-center gap-2">
                    <Trophy size={14} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      à¸•à¸²à¸£à¸²à¸‡à¸„à¸°à¹à¸™à¸™ à¸ªà¸²à¸¢ {activeGroupName}
                    </span>
                  </div>

                  {/* Desktop Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground text-[11px] uppercase tracking-wider">
                          <th className="text-center py-3 px-3 w-12">#</th>
                          <th className="text-left py-3 px-3">à¸—à¸µà¸¡</th>
                          <th className="text-center py-3 px-2 w-10">à¹€à¸¥à¹ˆà¸™</th>
                          <th className="text-center py-3 px-2 w-10">à¸Šà¸™à¸°</th>
                          <th className="text-center py-3 px-2 w-10">à¹€à¸ªà¸¡à¸­</th>
                          <th className="text-center py-3 px-2 w-10">à¹à¸žà¹‰</th>
                          <th className="text-center py-3 px-2 w-10">à¹„à¸”à¹‰</th>
                          <th className="text-center py-3 px-2 w-10">à¹€à¸ªà¸µà¸¢</th>
                          <th className="text-center py-3 px-2 w-12">à¸•à¹ˆà¸²à¸‡</th>
                          <th className="text-center py-3 px-3 w-14 font-bold">à¸„à¸°à¹à¸™à¸™</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="text-center py-16 text-muted-foreground text-sm">
                              à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸•à¸²à¸£à¸²à¸‡à¸„à¸°à¹à¸™à¸™
                            </td>
                          </tr>
                        ) : (
                          standings.map((row, idx) => {
                            const club = clubs[row.clubId] ?? { name: row.clubId, logo: "" };
                            const isQualified = idx < 2;
                            return (
                              <tr
                                key={row.clubId}
                                className={cn(
                                  "border-b border-border/50 hover:bg-muted/20",
                                  isQualified && "bg-emerald-500/5"
                                )}
                                style={{ transition: "background-color 150ms" }}
                              >
                                <td className="text-center py-3 px-3">
                                  <span className={cn(
                                    "inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold",
                                    isQualified
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "text-muted-foreground"
                                  )}>
                                    {idx + 1}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-3">
                                    {club.logo ? (
                                      <img src={club.logo} alt={club.name} className="w-7 h-7 rounded-full object-cover border border-border shrink-0" />
                                    ) : (
                                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                                        {club.name.slice(0, 2)}
                                      </div>
                                    )}
                                    <span className="font-semibold text-foreground">{club.name}</span>
                                  </div>
                                </td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{row.played}</td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{row.won}</td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{row.drawn}</td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{row.lost}</td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{row.goalsFor}</td>
                                <td className="text-center py-3 px-2 text-muted-foreground">{row.goalsAgainst}</td>
                                <td className="text-center py-3 px-2">
                                  <span className={cn(
                                    "font-medium",
                                    row.goalDiff > 0 ? "text-emerald-400" : row.goalDiff < 0 ? "text-red-400" : "text-muted-foreground"
                                  )}>
                                    {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                                  </span>
                                </td>
                                <td className="text-center py-3 px-3">
                                  <span className="text-base font-bold text-foreground">{row.points}</span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Legend */}
                  {standings.length > 0 && (
                    <div className="px-6 py-3 border-t border-border/50 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-emerald-500/20" />
                      <span className="text-[11px] text-muted-foreground">à¸œà¹ˆà¸²à¸™à¹€à¸‚à¹‰à¸²à¸£à¸­à¸šà¸™à¹‡à¸­à¸à¹€à¸­à¸²à¸•à¹Œ</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pb-32" />
    </div>
  );
}

// â”€â”€â”€ Page Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function StandingsPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      }
    >
      <StandingsContent />
    </Suspense>
  );
}

``n

## File: src/app/bracket/page.tsx

`$lang
"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  orderBy,
  documentId,
} from "firebase/firestore";
import type { BracketMatch } from "@/types/bracket";
import type { Club } from "@/types/club";

import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Swords } from "lucide-react";

export default function PublicBracketPage() {
  const [competitions, setCompetitions] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompId, setSelectedCompId] = useState("");
  const [matches, setMatches] = useState<BracketMatch[]>([]);
  const [clubsMap, setClubsMap] = useState<Record<string, Club>>({});
  const [loadingComps, setLoadingComps] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Load competitions once
  useEffect(() => {
    async function fetchComps() {
      try {
        const q = query(collection(db, "competitions"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const compsData = snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name as string,
        }));
        setCompetitions(compsData);
        if (compsData.length > 0) {
          setSelectedCompId(compsData[0].id);
        }
      } catch (error) {
        console.error("Error fetching competitions:", error);
      } finally {
        setLoadingComps(false);
      }
    }
    fetchComps();
  }, []);

  // Real-time listen to matches
  useEffect(() => {
    if (!selectedCompId) return;
    setLoadingMatches(true);

    const q = query(
      collection(db, "bracket_matches"),
      where("competitionId", "==", selectedCompId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => {
          const docData = d.data();
          return {
            id: d.id,
            ...docData,
            date: docData.date?.toDate ? docData.date.toDate().toISOString() : docData.date,
          } as BracketMatch;
        });

        // Sort locally by round ASC, position ASC
        data.sort((a, b) => {
          if (a.round !== b.round) return a.round - b.round;
          return a.position - b.position;
        });

        setMatches(data);
        setLoadingMatches(false);
      },
      (error) => {
        console.error("Error listening to bracket_matches:", error);
        setLoadingMatches(false);
      }
    );

    return () => unsubscribe();
  }, [selectedCompId]);

  // Fetch missing clubs when matches change
  useEffect(() => {
    async function fetchMissingClubs() {
      const teamIdsToFetch = new Set<string>();
      matches.forEach((m) => {
        if (m.homeTeamId && !clubsMap[m.homeTeamId]) teamIdsToFetch.add(m.homeTeamId);
        if (m.awayTeamId && !clubsMap[m.awayTeamId]) teamIdsToFetch.add(m.awayTeamId);
      });

      if (teamIdsToFetch.size === 0) return;

      const idsArray = Array.from(teamIdsToFetch);
      const newClubsMap: Record<string, Club> = {};

      // Chunk by 30 to comply with Firestore 'in' query limits
      for (let i = 0; i < idsArray.length; i += 30) {
        const chunk = idsArray.slice(i, i + 30);
        const q = query(collection(db, "clubs"), where(documentId(), "in", chunk));
        const snap = await getDocs(q);
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.status === "active") {
            newClubsMap[d.id] = { id: d.id, ...data } as Club;
          }
        });
      }

      setClubsMap((prev) => ({ ...prev, ...newClubsMap }));
    }

    if (matches.length > 0) {
      fetchMissingClubs();
    }
  }, [matches, clubsMap]);

  const getClub = (id: string) => clubsMap[id];

  // Group matches by round for visual rendering
  const rounds = useMemo(() => {
    const map = new Map<number, BracketMatch[]>();
    matches.forEach((m) => {
      const arr = map.get(m.round) || [];
      arr.push(m);
      map.set(m.round, arr);
    });
    const sortedRounds = Array.from(map.keys()).sort((a, b) => a - b);
    return sortedRounds.map((r) => map.get(r)!);
  }, [matches]);

  return (
    <div className="container py-12 space-y-8 min-h-[calc(100vh-200px)]">
      {/* Header & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">
            Knockout <span className="text-[#facc15]">Bracket</span>
          </h1>
          <p className="text-muted-foreground mt-2">à¸ªà¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¸£à¸­à¸šà¸™à¹‡à¸­à¸à¹€à¸­à¸²à¸•à¹Œ</p>
        </div>

        {loadingComps ? (
          <Skeleton className="h-12 w-full md:w-[300px] rounded-lg" />
        ) : (
          <select
            className="h-12 rounded-lg border-2 border-border bg-background px-4 text-base font-semibold min-w-[280px] focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none transition-all"
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
          >
            {competitions.length === 0 && <option value="">à¹„à¸¡à¹ˆà¸¡à¸µà¸£à¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™</option>}
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Bracket Board */}
      <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-lg relative">
        {loadingMatches ? (
          <div className="p-16 space-y-8">
            <Skeleton className="h-32 w-full max-w-4xl mx-auto rounded-xl opacity-50" />
            <Skeleton className="h-32 w-3/4 mx-auto rounded-xl opacity-30" />
            <Skeleton className="h-32 w-1/2 mx-auto rounded-xl opacity-10" />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center animate-pulse">
              <Swords size={40} className="text-muted-foreground/50" />
            </div>
            <div>
              <p className="font-bold text-2xl text-foreground">à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µà¸ªà¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™</p>
              <p className="text-muted-foreground mt-2">
                à¹‚à¸›à¸£à¸”à¸£à¸­à¸à¹ˆà¸²à¸¢à¸ˆà¸±à¸”à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¸­à¸±à¸›à¹€à¸”à¸•à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸£à¸­à¸šà¸™à¹‡à¸­à¸à¹€à¸­à¸²à¸•à¹Œ
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12 overflow-x-auto custom-scrollbar">
            <div className="flex gap-16 min-w-max pb-8 pt-12">
              {rounds.map((roundMatches, roundIndex) => (
                <div
                  key={roundIndex}
                  className="flex flex-col justify-around gap-8 w-[320px] relative"
                >
                  {/* Round Header */}
                  <div className="absolute -top-12 left-0 right-0 text-center font-black text-muted-foreground/40 uppercase tracking-widest text-xl">
                    {roundMatches[0].roundName === "F" ? (
                      <span className="text-[#facc15] flex items-center justify-center gap-2 drop-shadow-sm">
                        <Trophy size={20} /> FINAL
                      </span>
                    ) : (
                      roundMatches[0].roundName
                    )}
                  </div>

                  {roundMatches.map((match) => {
                    const home = getClub(match.homeTeamId);
                    const away = getClub(match.awayTeamId);
                    const isCompleted = match.status === "completed";
                    const hasResult = isCompleted && match.winnerId !== "";

                    const homeWon = hasResult && match.winnerId === match.homeTeamId;
                    const awayWon = hasResult && match.winnerId === match.awayTeamId;

                    return (
                      <div
                        key={match.id}
                        className="relative bg-background border-2 border-border/50 rounded-xl shadow-md transition-all hover:border-border/80"
                      >
                        {/* Live Badge */}
                        {match.status === "live" && (
                          <div className="absolute -top-3 -right-3 z-10">
                            <span className="relative flex h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-background"></span>
                            </span>
                          </div>
                        )}

                        {/* Match Layout */}
                        <div className="flex flex-col">
                          {/* Home Team */}
                          <div
                            className={`flex items-center justify-between p-4 border-b border-border/30 transition-all ${
                              hasResult && !homeWon ? "opacity-40 grayscale" : ""
                            } ${homeWon ? "bg-[#facc15]/10 border-l-4 border-l-[#facc15]" : "border-l-4 border-l-transparent"}`}
                          >
                            <div className="flex items-center gap-3">
                              {home?.logo ? (
                                <img
                                  src={home.logo}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover shadow-sm bg-white"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-muted rounded-full shadow-inner" />
                              )}
                              <span className={`text-base font-bold truncate max-w-[160px] ${homeWon ? "text-[#facc15]" : ""}`}>
                                {home?.name || "TBD"}
                              </span>
                            </div>
                            <span className={`text-lg font-black ${homeWon ? "text-[#facc15]" : "text-muted-foreground"}`}>
                              {isCompleted || match.status === "live" ? match.homeScore : "-"}
                            </span>
                          </div>

                          {/* Away Team */}
                          <div
                            className={`flex items-center justify-between p-4 transition-all ${
                              hasResult && !awayWon ? "opacity-40 grayscale" : ""
                            } ${awayWon ? "bg-[#facc15]/10 border-l-4 border-l-[#facc15]" : "border-l-4 border-l-transparent"}`}
                          >
                            <div className="flex items-center gap-3">
                              {away?.logo ? (
                                <img
                                  src={away.logo}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover shadow-sm bg-white"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-muted rounded-full shadow-inner" />
                              )}
                              <span className={`text-base font-bold truncate max-w-[160px] ${awayWon ? "text-[#facc15]" : ""}`}>
                                {away?.name || "TBD"}
                              </span>
                            </div>
                            <span className={`text-lg font-black ${awayWon ? "text-[#facc15]" : "text-muted-foreground"}`}>
                              {isCompleted || match.status === "live" ? match.awayScore : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Champion Column */}
              <div className="flex flex-col justify-center items-center w-[240px] pl-12 relative">
                {(() => {
                  const finalMatch = rounds[rounds.length - 1]?.[0];
                  if (finalMatch && finalMatch.status === "completed" && finalMatch.winnerId) {
                    const champ = getClub(finalMatch.winnerId);
                    return (
                      <div className="flex flex-col items-center animate-in zoom-in slide-in-from-left-8 duration-700">
                        <div className="relative">
                          {/* CSS Animation glow behind trophy */}
                          <div className="absolute inset-0 bg-[#facc15] blur-3xl opacity-20 rounded-full animate-pulse" />
                          <Trophy size={80} className="text-[#facc15] mb-6 drop-shadow-2xl relative z-10" />
                        </div>
                        {champ?.logo && (
                          <img
                            src={champ.logo}
                            alt=""
                            className="w-28 h-28 rounded-full object-cover border-4 border-[#facc15] mb-4 shadow-[0_0_30px_rgba(250,204,21,0.3)] bg-white relative z-10"
                          />
                        )}
                        <span className="text-2xl font-black text-center text-[#facc15] drop-shadow-md">
                          {champ?.name}
                        </span>
                        <span className="text-sm font-bold text-[#facc15]/60 mt-2 tracking-[0.3em] uppercase">
                          Champion
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-col items-center opacity-10 grayscale">
                      <Trophy size={80} className="mb-6" />
                      <span className="font-black tracking-widest text-xl">CHAMPION</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

``n

## File: src/app/news/page.tsx

`$lang
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import type { News } from "@/types/news";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Play, Loader2, Calendar } from "lucide-react";

const ITEMS_PER_PAGE = 12;

export default function PublicNewsPage() {
  const [activeTab, setActiveTab] = useState<"news" | "highlight">("news");
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchNews = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) {
      setLoading(true);
      setNews([]);
      setHasMore(true);
      setLastDoc(null);
    } else {
      setLoadingMore(true);
    }

    try {
      let q = query(
        collection(db, "news"),
        where("status", "==", "published"),
        where("category", "==", activeTab),
        orderBy("publishedAt", "desc"),
        limit(ITEMS_PER_PAGE)
      );

      if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snap = await getDocs(q);
      
      const newDocs = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate().toISOString() : data.publishedAt,
        } as News;
      });

      if (isLoadMore) {
        setNews((prev) => [...prev, ...newDocs]);
      } else {
        setNews(newDocs);
      }

      if (snap.docs.length > 0) {
        setLastDoc(snap.docs[snap.docs.length - 1]);
      }

      if (snap.docs.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, lastDoc]); // eslint-disable-line react-hooks/exhaustive-deps

  // We want to fetch news when activeTab changes, so we don't include lastDoc in this effect's deps
  useEffect(() => {
    fetchNews(false);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-screen-xl mx-auto px-8 pt-28 pb-20 space-y-12 min-h-[calc(100vh-200px)]">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
            News & <span className="text-[#facc15]">Highlights</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">
            à¸•à¸´à¸”à¸•à¸²à¸¡à¸‚à¹ˆà¸²à¸§à¸ªà¸²à¸£à¹à¸¥à¸°à¸Šà¸¡à¸„à¸¥à¸´à¸›à¹„à¸®à¹„à¸¥à¸•à¹Œà¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¸¥à¹ˆà¸²à¸ªà¸¸à¸”
          </p>
        </div>

        <div className="flex bg-muted/50 p-1 rounded-xl w-full md:w-64 shrink-0">
          <button
            onClick={() => setActiveTab("news")}
            className={`flex-1 md:w-32 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "news"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Newspaper size={18} /> à¸‚à¹ˆà¸²à¸§à¸ªà¸²à¸£
          </button>
          <button
            onClick={() => setActiveTab("highlight")}
            className={`flex-1 md:w-32 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "highlight"
                ? "bg-background text-[#facc15] shadow-sm"
                : "text-muted-foreground hover:text-[#facc15] hover:bg-muted"
            }`}
          >
            <Play size={18} /> à¹„à¸®à¹„à¸¥à¸•à¹Œ
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="w-full aspect-[16/9] rounded-2xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/4" />
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center">
            {activeTab === "news" ? (
              <Newspaper size={32} className="text-muted-foreground/50" />
            ) : (
              <Play size={32} className="text-muted-foreground/50" />
            )}
          </div>
          <div>
            <p className="font-bold text-2xl text-foreground">
              à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µ{activeTab === "news" ? "à¸‚à¹ˆà¸²à¸§à¸ªà¸²à¸£" : "à¹„à¸®à¹„à¸¥à¸•à¹Œ"}à¹ƒà¸™à¸‚à¸“à¸°à¸™à¸µà¹‰
            </p>
            <p className="text-muted-foreground mt-2">à¹‚à¸›à¸£à¸”à¸•à¸´à¸”à¸•à¸²à¸¡à¸­à¸±à¸›à¹€à¸”à¸•à¹€à¸žà¸´à¹ˆà¸¡à¹€à¸•à¸´à¸¡à¹€à¸£à¹‡à¸§à¹† à¸™à¸µà¹‰</p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {news.map((item) => (
              <Link
                href={`/news/${item.id}`}
                key={item.id}
                className="group flex flex-col gap-5 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#facc15] rounded-2xl"
              >
                {/* 16:9 Image Container */}
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-muted border border-border/20 shadow-sm transition-transform duration-500 group-hover:shadow-lg group-hover:-translate-y-1">
                  <Badge 
                    className={`absolute top-4 left-4 z-20 border-none px-3 py-1 text-xs font-bold ${
                      item.category === 'highlight' 
                        ? 'bg-purple-600 text-white hover:bg-purple-600' 
                        : 'bg-[#facc15] text-black hover:bg-[#facc15]'
                    }`}
                  >
                    {item.category === "highlight" ? "HIGHLIGHT" : "NEWS"}
                  </Badge>

                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper size={48} className="text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      item.category === 'highlight' ? 'bg-purple-600 text-white' : 'bg-[#facc15] text-black'
                    } transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300`}>
                      {item.category === "highlight" ? <Play size={24} className="ml-1" /> : <Newspaper size={24} />}
                    </div>
                    <span className="text-white font-bold tracking-widest text-sm uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      à¸­à¹ˆà¸²à¸™à¸•à¹ˆà¸­
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-2 px-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Calendar size={14} />
                    <span>{new Date(item.publishedAt as string).toLocaleDateString("th-TH", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <h3 className="text-2xl font-bold leading-tight group-hover:text-[#facc15] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={() => fetchNews(true)}
                disabled={loadingMore}
                className="w-full md:w-auto min-w-[200px] border-border hover:bg-muted font-bold tracking-wider"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    à¸à¸³à¸¥à¸±à¸‡à¹‚à¸«à¸¥à¸”...
                  </>
                ) : (
                  "à¹‚à¸«à¸¥à¸”à¹€à¸žà¸´à¹ˆà¸¡à¹€à¸•à¸´à¸¡"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

``n

## File: src/app/actions/admin/bracketActions.ts

`$lang
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { BracketMatch } from "@/types/bracket";

// â”€â”€â”€ Helper: Verify Admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function verifyAdmin(currentUid: string): Promise<void> {
  const userDoc = await adminDb.collection("users").doc(currentUid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    throw new Error("à¹„à¸¡à¹ˆà¸¡à¸µà¸ªà¸´à¸—à¸˜à¸´à¹Œà¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£: à¸•à¹‰à¸­à¸‡à¹€à¸›à¹‡à¸™ Admin à¹€à¸—à¹ˆà¸²à¸™à¸±à¹‰à¸™");
  }
}

// â”€â”€â”€ Helper: Get Round Name â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getRoundName(round: number): "RO16" | "QF" | "SF" | "F" {
  if (round === 1) return "RO16";
  if (round === 2) return "QF";
  if (round === 3) return "SF";
  return "F";
}

export interface ActionResult {
  success: boolean;
  message: string;
}

// â”€â”€â”€ 1. Generate Bracket â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function generateBracket(
  currentUid: string,
  competitionId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    // 1. Fetch groups and standings
    const [groupsSnap, standingsSnap] = await Promise.all([
      adminDb.collection("groups").where("competitionId", "==", competitionId).get(),
      adminDb.collection("standings").where("competitionId", "==", competitionId).get(),
    ]);

    if (groupsSnap.empty) {
      return { success: false, message: "à¹„à¸¡à¹ˆà¸žà¸šà¸à¸¥à¸¸à¹ˆà¸¡à¹ƒà¸™à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¸™à¸µà¹‰" };
    }

    const groups = groupsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as { id: string; name: string }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const standings = standingsSnap.docs.map((d) => d.data() as any);

    // Get Top 2 of each group
    const groupTop2 = groups.map((g) => {
      const st = standings
        .filter((s) => s.groupId === g.id)
        .sort(
          (a, b) =>
            b.points - a.points ||
            b.goalDiff - a.goalDiff ||
            b.goalsFor - a.goalsFor
        );
      return st.slice(0, 2).map((s) => s.clubId as string);
    });

    const numTeams = groups.length * 2;
    // Calculate starting round (e.g. 16 teams -> round 1 (RO16), 8 teams -> round 2 (QF))
    // Fallback to round 1 if there's a weird number of teams, or cap it.
    const startingRound = Math.max(1, 4 - Math.log2(Math.max(2, numTeams) / 2));

    const batch = adminDb.batch();

    // 2. Delete existing bracket for this competition
    const existingSnap = await adminDb
      .collection("bracket_matches")
      .where("competitionId", "==", competitionId)
      .get();
    existingSnap.docs.forEach((d) => batch.delete(d.ref));

    // 3. Generate matches top-down (from Final down to starting round)
    const allMatches: any[] = [];
    let nextRoundMatches: any[] = [];

    for (let r = 4; r >= startingRound; r--) {
      const numMatchesInRound = Math.pow(2, 4 - r);
      const currentRound: any[] = [];

      for (let i = 0; i < numMatchesInRound; i++) {
        const id = adminDb.collection("bracket_matches").doc().id;
        const match = {
          id,
          competitionId,
          round: r,
          roundName: getRoundName(r),
          position: i + 1,
          homeTeamId: "",
          awayTeamId: "",
          homeScore: 0,
          awayScore: 0,
          winnerId: "",
          status: "scheduled",
          nextMatchId: "",
          venue: "",
        };

        if (r < 4) {
          // Link to the next round (created in previous loop iteration)
          match.nextMatchId = nextRoundMatches[Math.floor(i / 2)].id;
        }

        currentRound.push(match);
        allMatches.unshift(match);
      }
      nextRoundMatches = currentRound;
    }

    // 4. Populate cross-pairings in the starting round matches
    const startingMatches = allMatches.filter((m) => m.round === startingRound);
    let matchIndex = 0;

    for (let i = 0; i < groupTop2.length; i += 2) {
      const g1 = groupTop2[i]; // [1A, 2A]
      const g2 = groupTop2[i + 1] || ["", ""]; // [1B, 2B]

      if (startingMatches[matchIndex]) {
        startingMatches[matchIndex].homeTeamId = g1[0] || ""; // 1A
        startingMatches[matchIndex].awayTeamId = g2[1] || ""; // 2B
      }
      matchIndex++;

      if (startingMatches[matchIndex]) {
        startingMatches[matchIndex].homeTeamId = g2[0] || ""; // 1B
        startingMatches[matchIndex].awayTeamId = g1[1] || ""; // 2A
      }
      matchIndex++;
    }

    // 5. Commit batch
    allMatches.forEach((m) => {
      const ref = adminDb.collection("bracket_matches").doc(m.id);
      batch.set(ref, {
        ...m,
        date: FieldValue.serverTimestamp(), // Initial placeholder date
      });
    });

    await batch.commit();

    return { success: true, message: "à¸ªà¸£à¹‰à¸²à¸‡à¸ªà¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™ (Bracket) à¸ªà¸³à¹€à¸£à¹‡à¸ˆ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ 2. Update Bracket Result â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function updateBracketResult(
  currentUid: string,
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const matchRef = adminDb.collection("bracket_matches").doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      return { success: false, message: "à¹„à¸¡à¹ˆà¸žà¸šà¹à¸¡à¸•à¸Šà¹Œà¸™à¸µà¹‰à¹ƒà¸™à¸£à¸°à¸šà¸š" };
    }

    const matchData = matchDoc.data() as BracketMatch;
    
    // Determine winner (assuming no draws in knockout)
    let winnerId = "";
    if (homeScore > awayScore) winnerId = matchData.homeTeamId;
    else if (awayScore > homeScore) winnerId = matchData.awayTeamId;

    const batch = adminDb.batch();

    batch.update(matchRef, {
      homeScore,
      awayScore,
      winnerId,
      status: "completed",
    });

    // Auto-advance winner to next match if exists
    if (winnerId && matchData.nextMatchId) {
      const nextMatchRef = adminDb.collection("bracket_matches").doc(matchData.nextMatchId);
      // ODD position -> homeTeam slot, EVEN position -> awayTeam slot
      if (matchData.position % 2 === 1) {
        batch.update(nextMatchRef, { homeTeamId: winnerId });
      } else {
        batch.update(nextMatchRef, { awayTeamId: winnerId });
      }
    }

    await batch.commit();

    return { success: true, message: "à¸šà¸±à¸™à¸—à¸¶à¸à¸œà¸¥à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¹à¸¥à¸°à¹€à¸¥à¸·à¹ˆà¸­à¸™à¸£à¸­à¸šà¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ 3. Update Bracket Status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function updateBracketStatus(
  currentUid: string,
  matchId: string,
  status: "scheduled" | "live" | "completed"
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);
    const matchRef = adminDb.collection("bracket_matches").doc(matchId);
    await matchRef.update({ status });
    return { success: true, message: "à¸­à¸±à¸›à¹€à¸”à¸•à¸ªà¸–à¸²à¸™à¸°à¹à¸¡à¸•à¸Šà¹Œà¸ªà¸³à¹€à¸£à¹‡à¸ˆ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ 4. Delete Bracket â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function deleteBracket(
  currentUid: string,
  competitionId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const matchesSnap = await adminDb
      .collection("bracket_matches")
      .where("competitionId", "==", competitionId)
      .get();

    if (matchesSnap.empty) {
      return { success: false, message: "à¹„à¸¡à¹ˆà¸¡à¸µà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¹ƒà¸«à¹‰à¸¥à¸š" };
    }

    const batch = adminDb.batch();
    matchesSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    return { success: true, message: "à¸¥à¸šà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸²à¸¢à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¸ªà¸³à¹€à¸£à¹‡à¸ˆ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ 5. Get Bracket Matches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getBracketMatches(
  competitionId: string
): Promise<BracketMatch[]> {
  try {
    const snap = await adminDb
      .collection("bracket_matches")
      .where("competitionId", "==", competitionId)
      .get();
      
    const matches = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
      } as unknown as BracketMatch;
    });

    // Sort by round ASC, position ASC
    return matches.sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return a.position - b.position;
    });
  } catch (error) {
    console.error("Error fetching bracket matches:", error);
    return [];
  }
}

``n

## File: src/app/actions/admin/drawActions.ts

`$lang
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import type { CompetitionForDraw, Group } from "@/types/tournament";

// â”€â”€â”€ Helper: Verify caller is admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function verifyAdmin(currentUid: string): Promise<void> {
  const userDoc = await adminDb.collection("users").doc(currentUid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    throw new Error("à¹„à¸¡à¹ˆà¸¡à¸µà¸ªà¸´à¸—à¸˜à¸´à¹Œà¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£: à¸•à¹‰à¸­à¸‡à¹€à¸›à¹‡à¸™ Admin à¹€à¸—à¹ˆà¸²à¸™à¸±à¹‰à¸™");
  }
}

interface ActionResult {
  success: boolean;
  message: string;
}

interface TeamItem {
  id: string;
  name: string;
  logo: string;
}

const ALPHA = ["A", "B", "C", "D", "E", "F", "G", "H"];

// â”€â”€â”€ Action 1: Get competitions for draw page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getCompetitionsForDraw(
  currentUid: string
): Promise<{ success: boolean; message: string; competitions: CompetitionForDraw[] }> {
  try {
    await verifyAdmin(currentUid);

    const snap = await adminDb
      .collection("competitions")
      .orderBy("createdAt", "desc")
      .get();

    const competitions: CompetitionForDraw[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: (data.name as string) ?? "",
        status: (data.status as "Open" | "Closed") ?? "Open",
        teamQuota: (data.teamQuota as number) ?? 0,
        numberOfGroups: (data.numberOfGroups as number) ?? 0,
        teamsPerGroup: (data.teamsPerGroup as number) ?? 0,
      };
    });

    return { success: true, message: "", competitions };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg, competitions: [] };
  }
}

// â”€â”€â”€ Action 2: Get or create groups for a competition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getOrCreateGroups(
  currentUid: string,
  competitionId: string,
  numberOfGroups: number
): Promise<{ success: boolean; message: string; groups: Group[] }> {
  try {
    await verifyAdmin(currentUid);

    // Check for existing groups
    const existing = await adminDb
      .collection("groups")
      .where("competitionId", "==", competitionId)
      .get();

    if (!existing.empty) {
      const groups: Group[] = existing.docs
        .map((d) => ({ id: d.id, ...d.data() } as Group))
        .sort((a, b) => a.name.localeCompare(b.name));
      return { success: true, message: "", groups };
    }

    // Create empty groups
    const batch = adminDb.batch();
    const groupNames = ALPHA.slice(0, numberOfGroups);
    const createdGroups: Group[] = [];

    for (const name of groupNames) {
      const ref = adminDb.collection("groups").doc();
      const group: Group = {
        id: ref.id,
        competitionId,
        name,
        teamIds: [],
      };
      batch.set(ref, {
        competitionId,
        name,
        teamIds: [],
      });
      createdGroups.push(group);
    }

    await batch.commit();
    return { success: true, message: "", groups: createdGroups };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg, groups: [] };
  }
}

// â”€â”€â”€ Action 3: Get approved teams for a competition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getApprovedTeamsForDraw(
  currentUid: string,
  competitionId: string
): Promise<{ success: boolean; message: string; teams: TeamItem[] }> {
  try {
    await verifyAdmin(currentUid);

    const snap = await adminDb
      .collection("team_registrations")
      .where("competitionId", "==", competitionId)
      .where("status", "==", "Approved")
      .get();

    const teams: TeamItem[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: (data.clubId as string) || d.id,
        name: (data.teamName as string) ?? "",
        logo: (data.logoUrl as string) ?? "",
      };
    });

    return { success: true, message: "", teams };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg, teams: [] };
  }
}

// â”€â”€â”€ Action 4: Save group draw â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function saveGroupDraw(
  currentUid: string,
  competitionId: string,
  assignments: { groupId: string; teamIds: string[] }[]
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    // Validate no duplicates
    const allIds = assignments.flatMap((a) => a.teamIds);
    if (allIds.length !== new Set(allIds).size) {
      return { success: false, message: "à¸žà¸šà¸—à¸µà¸¡à¸‹à¹‰à¸³à¸à¸±à¸™à¹ƒà¸™à¸ªà¸²à¸¢à¸•à¹ˆà¸²à¸‡à¹† à¸à¸£à¸¸à¸“à¸²à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸š" };
    }

    const batch = adminDb.batch();

    for (const { groupId, teamIds } of assignments) {
      const ref = adminDb.collection("groups").doc(groupId);
      batch.update(ref, { teamIds });
    }

    await batch.commit();

    return { success: true, message: `à¸šà¸±à¸™à¸—à¸¶à¸à¸à¸²à¸£à¹à¸šà¹ˆà¸‡à¸ªà¸²à¸¢ ${assignments.length} à¸ªà¸²à¸¢ à¸ªà¸³à¹€à¸£à¹‡à¸ˆ` };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

``n

## File: src/app/actions/admin/matchActions.ts

`$lang
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue, FieldPath } from "firebase-admin/firestore";
import type { Match, Standing } from "@/types/match";

// â”€â”€â”€ Helper: Verify caller is admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function verifyAdmin(currentUid: string): Promise<void> {
  const userDoc = await adminDb.collection("users").doc(currentUid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    throw new Error("à¹„à¸¡à¹ˆà¸¡à¸µà¸ªà¸´à¸—à¸˜à¸´à¹Œà¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£: à¸•à¹‰à¸­à¸‡à¹€à¸›à¹‡à¸™ Admin à¹€à¸—à¹ˆà¸²à¸™à¸±à¹‰à¸™");
  }
}

interface ActionResult {
  success: boolean;
  message: string;
}

// â”€â”€â”€ Standings Document ID convention â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function standingDocId(
  competitionId: string,
  groupId: string,
  clubId: string
): string {
  return `${competitionId}_${groupId}_${clubId}`;
}

// â”€â”€â”€ Recalculate standings for a single club in a group â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Fetches all completed matches for this club in this group and
// recomputes stats from scratch to ensure accuracy.
async function recalculateStanding(
  batch: FirebaseFirestore.WriteBatch,
  competitionId: string,
  groupId: string,
  clubId: string
): Promise<void> {
  // Fetch all completed matches in this group where club is involved
  const [homeSnap, awaySnap] = await Promise.all([
    adminDb
      .collection("matches")
      .where("competitionId", "==", competitionId)
      .where("groupId", "==", groupId)
      .where("homeTeamId", "==", clubId)
      .where("status", "==", "completed")
      .get(),
    adminDb
      .collection("matches")
      .where("competitionId", "==", competitionId)
      .where("groupId", "==", groupId)
      .where("awayTeamId", "==", clubId)
      .where("status", "==", "completed")
      .get(),
  ]);

  let played = 0;
  let won = 0;
  let drawn = 0;
  let lost = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  homeSnap.docs.forEach((d) => {
    const data = d.data();
    const hs = data.homeScore as number;
    const as_ = data.awayScore as number;
    played++;
    goalsFor += hs;
    goalsAgainst += as_;
    if (hs > as_) won++;
    else if (hs === as_) drawn++;
    else lost++;
  });

  awaySnap.docs.forEach((d) => {
    const data = d.data();
    const hs = data.homeScore as number;
    const as_ = data.awayScore as number;
    played++;
    goalsFor += as_;
    goalsAgainst += hs;
    if (as_ > hs) won++;
    else if (as_ === hs) drawn++;
    else lost++;
  });

  const goalDiff = goalsFor - goalsAgainst;
  const points = won * 3 + drawn;

  const standing: Standing = {
    competitionId,
    groupId,
    clubId,
    played,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    goalDiff,
    points,
  };

  const docId = standingDocId(competitionId, groupId, clubId);
  const ref = adminDb.collection("standings").doc(docId);
  batch.set(ref, standing, { merge: true });
}

// â”€â”€â”€ Action 1: Create Match â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function createMatch(
  currentUid: string,
  data: Omit<Match, "id">
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    if (data.homeTeamId === data.awayTeamId) {
      return { success: false, message: "à¸—à¸µà¸¡à¹€à¸«à¸¢à¹‰à¸²à¹à¸¥à¸°à¸—à¸µà¸¡à¹€à¸¢à¸·à¸­à¸™à¸•à¹‰à¸­à¸‡à¹€à¸›à¹‡à¸™à¸„à¸™à¸¥à¸°à¸—à¸µà¸¡" };
    }

    await adminDb.collection("matches").add({
      ...data,
      homeScore: 0,
      awayScore: 0,
      status: "scheduled",
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "à¸ªà¸£à¹‰à¸²à¸‡à¹à¸¡à¸•à¸Šà¹Œà¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢à¹à¸¥à¹‰à¸§" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ Action 2: Update Match Result â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function updateMatchResult(
  currentUid: string,
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const matchRef = adminDb.collection("matches").doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      return { success: false, message: "à¹„à¸¡à¹ˆà¸žà¸šà¹à¸¡à¸•à¸Šà¹Œà¸™à¸µà¹‰à¹ƒà¸™à¸£à¸°à¸šà¸š" };
    }

    const matchData = matchDoc.data() as Omit<Match, "id">;
    const { competitionId, groupId, homeTeamId, awayTeamId } = matchData;

    // Update match document
    await matchRef.update({
      homeScore,
      awayScore,
      status: "completed",
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Recalculate standings for both teams
    const batch = adminDb.batch();
    await Promise.all([
      recalculateStanding(batch, competitionId, groupId, homeTeamId),
      recalculateStanding(batch, competitionId, groupId, awayTeamId),
    ]);
    await batch.commit();

    return { success: true, message: "à¸šà¸±à¸™à¸—à¸¶à¸à¸œà¸¥à¹à¸¥à¸°à¸­à¸±à¸›à¹€à¸”à¸•à¸•à¸²à¸£à¸²à¸‡à¸„à¸°à¹à¸™à¸™à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ Action 3: Update Match Status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function updateMatchStatus(
  currentUid: string,
  matchId: string,
  status: "scheduled" | "live" | "completed" | "postponed"
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const matchRef = adminDb.collection("matches").doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      return { success: false, message: "à¹„à¸¡à¹ˆà¸žà¸šà¹à¸¡à¸•à¸Šà¹Œà¸™à¸µà¹‰à¹ƒà¸™à¸£à¸°à¸šà¸š" };
    }

    await matchRef.update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "à¸­à¸±à¸›à¹€à¸”à¸•à¸ªà¸–à¸²à¸™à¸°à¹à¸¡à¸•à¸Šà¹Œà¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ Action 4: Delete Match â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function deleteMatch(
  currentUid: string,
  matchId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const matchRef = adminDb.collection("matches").doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      return { success: false, message: "à¹„à¸¡à¹ˆà¸žà¸šà¹à¸¡à¸•à¸Šà¹Œà¸™à¸µà¹‰à¹ƒà¸™à¸£à¸°à¸šà¸š" };
    }

    const matchData = matchDoc.data() as Omit<Match, "id">;
    const { competitionId, groupId, homeTeamId, awayTeamId, status } = matchData;

    // Delete match
    await matchRef.delete();

    // Recalculate standings only if this match was completed
    if (status === "completed") {
      const batch = adminDb.batch();
      await Promise.all([
        recalculateStanding(batch, competitionId, groupId, homeTeamId),
        recalculateStanding(batch, competitionId, groupId, awayTeamId),
      ]);
      await batch.commit();
    }

    return { success: true, message: "à¸¥à¸šà¹à¸¡à¸•à¸Šà¹Œà¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢à¹à¸¥à¹‰à¸§" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ Action 5: Get Matches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getMatches(
  currentUid: string,
  competitionId: string,
  groupId?: string
): Promise<{ success: boolean; message: string; matches: Match[] }> {
  try {
    await verifyAdmin(currentUid);

    let q = adminDb
      .collection("matches")
      .where("competitionId", "==", competitionId)
      .orderBy("date", "asc");

    if (groupId) {
      q = adminDb
        .collection("matches")
        .where("competitionId", "==", competitionId)
        .where("groupId", "==", groupId)
        .orderBy("date", "asc");
    }

    const snap = await q.get();
    const matches: Match[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Match, "id">),
    }));

    return { success: true, message: "", matches };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg, matches: [] };
  }
}

// â”€â”€â”€ Action 6: Get Groups for a Competition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getGroupsForCompetition(
  currentUid: string,
  competitionId: string
): Promise<{
  success: boolean;
  message: string;
  groups: { id: string; name: string; teamIds: string[] }[];
}> {
  try {
    await verifyAdmin(currentUid);

    const snap = await adminDb
      .collection("groups")
      .where("competitionId", "==", competitionId)
      .orderBy("name", "asc")
      .get();

    const groups = snap.docs.map((d) => ({
      id: d.id,
      name: d.data().name as string,
      teamIds: (d.data().teamIds as string[]) ?? [],
    }));

    return { success: true, message: "", groups };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg, groups: [] };
  }
}

// â”€â”€â”€ Action 7: Get Clubs by IDs (chunked) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getClubsByIds(
  currentUid: string,
  clubIds: string[]
): Promise<{
  success: boolean;
  message: string;
  clubs: { id: string; name: string; logo: string }[];
}> {
  try {
    await verifyAdmin(currentUid);

    if (clubIds.length === 0) {
      return { success: true, message: "", clubs: [] };
    }

    const chunks: string[][] = [];
    for (let i = 0; i < clubIds.length; i += 30) {
      chunks.push(clubIds.slice(i, i + 30));
    }

    const results: { id: string; name: string; logo: string }[] = [];

    await Promise.all(
      chunks.map(async (chunk) => {
        const snap = await adminDb
          .collection("clubs")
          .where(FieldPath.documentId(), "in", chunk)
          .get();
        snap.docs.forEach((d) => {
          results.push({
            id: d.id,
            name: (d.data().name as string) ?? "",
            logo: (d.data().logo as string) ?? "",
          });
        });
      })
    );

    return { success: true, message: "", clubs: results };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg, clubs: [] };
  }
}

// â”€â”€â”€ Action 8: Get Competitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getCompetitions(currentUid: string): Promise<{
  success: boolean;
  message: string;
  competitions: { id: string; name: string; status: string }[];
}> {
  try {
    await verifyAdmin(currentUid);

    const snap = await adminDb
      .collection("competitions")
      .orderBy("createdAt", "desc")
      .get();

    const competitions = snap.docs.map((d) => ({
      id: d.id,
      name: (d.data().name as string) ?? "",
      status: (d.data().status as string) ?? "Open",
    }));

    return { success: true, message: "", competitions };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg, competitions: [] };
  }
}



``n

## File: src/app/actions/admin/newsActions.ts

`$lang
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import type { News } from "@/types/news";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// â”€â”€â”€ Helper: Verify Admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function verifyAdmin(currentUid: string): Promise<void> {
  const userDoc = await adminDb.collection("users").doc(currentUid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    throw new Error("à¹„à¸¡à¹ˆà¸¡à¸µà¸ªà¸´à¸—à¸˜à¸´à¹Œà¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£: à¸•à¹‰à¸­à¸‡à¹€à¸›à¹‡à¸™ Admin à¹€à¸—à¹ˆà¸²à¸™à¸±à¹‰à¸™");
  }
}

export interface ActionResult {
  success: boolean;
  message: string;
}

// â”€â”€â”€ 1. Create News â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function createNews(
  currentUid: string,
  data: Omit<News, "id" | "publishedAt">
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const newsRef = adminDb.collection("news").doc();
    await newsRef.set({
      ...data,
      publishedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "à¸ªà¸£à¹‰à¸²à¸‡à¸‚à¹ˆà¸²à¸§/à¹„à¸®à¹„à¸¥à¸•à¹Œà¸ªà¸³à¹€à¸£à¹‡à¸ˆ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ 2. Update News â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function updateNews(
  currentUid: string,
  newsId: string,
  data: Partial<Omit<News, "id" | "publishedAt">>
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const newsRef = adminDb.collection("news").doc(newsId);
    const newsDoc = await newsRef.get();

    if (!newsDoc.exists) {
      return { success: false, message: "à¹„à¸¡à¹ˆà¸žà¸šà¸‚à¹ˆà¸²à¸§/à¹„à¸®à¹„à¸¥à¸•à¹Œà¸™à¸µà¹‰" };
    }

    await newsRef.update(data);

    return { success: true, message: "à¸­à¸±à¸›à¹€à¸”à¸•à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸³à¹€à¸£à¹‡à¸ˆ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ Helper: Extract Cloudinary Public ID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function extractPublicId(url: string): string | null {
  if (!url.includes("res.cloudinary.com")) return null;
  // url pattern: .../upload/v1234567890/folder/filename.jpg
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const pathAndVersion = parts[1];
    const withoutVersion = pathAndVersion.replace(/^v\d+\//, "");
    const lastDotIndex = withoutVersion.lastIndexOf(".");
    if (lastDotIndex === -1) return withoutVersion;
    return withoutVersion.substring(0, lastDotIndex);
  } catch {
    return null;
  }
}

// â”€â”€â”€ 3. Delete News â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function deleteNews(
  currentUid: string,
  newsId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const newsRef = adminDb.collection("news").doc(newsId);
    const newsDoc = await newsRef.get();

    if (!newsDoc.exists) {
      return { success: false, message: "à¹„à¸¡à¹ˆà¸žà¸šà¸‚à¹ˆà¸²à¸§/à¹„à¸®à¹„à¸¥à¸•à¹Œà¸™à¸µà¹‰" };
    }

    const data = newsDoc.data() as News;
    const batch = adminDb.batch();

    batch.delete(newsRef);

    // Delete image from Cloudinary if it exists
    if (data.coverImage) {
      const publicId = extractPublicId(data.coverImage);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error("Cloudinary delete error:", cloudinaryError);
          // Proceed with database deletion even if image delete fails
        }
      }
    }

    await batch.commit();

    return { success: true, message: "à¸¥à¸šà¸‚à¹ˆà¸²à¸§/à¹„à¸®à¹„à¸¥à¸•à¹Œà¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢à¹à¸¥à¹‰à¸§" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ 4. Publish News â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function publishNews(
  currentUid: string,
  newsId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const newsRef = adminDb.collection("news").doc(newsId);
    await newsRef.update({ status: "published" });

    return { success: true, message: "à¹€à¸œà¸¢à¹à¸žà¸£à¹ˆà¸‚à¹ˆà¸²à¸§à¸ªà¸³à¹€à¸£à¹‡à¸ˆ" };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ 5. Get News â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function getNews(
  status?: "draft" | "published",
  category?: "news" | "highlight",
  limitCount: number = 20
): Promise<News[]> {
  try {
    let query: FirebaseFirestore.Query = adminDb.collection("news");

    if (status) {
      query = query.where("status", "==", status);
    }
    if (category) {
      query = query.where("category", "==", category);
    }

    query = query.orderBy("publishedAt", "desc").limit(limitCount);

    const snap = await query.get();
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        publishedAt: data.publishedAt?.toDate ? data.publishedAt.toDate().toISOString() : data.publishedAt,
      } as unknown as News;
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

``n

## File: src/app/actions/admin/registrationActions.ts

`$lang
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// â”€â”€â”€ Helper: Verify caller is admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function verifyAdmin(currentUid: string): Promise<void> {
  const userDoc = await adminDb.collection("users").doc(currentUid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    throw new Error("à¹„à¸¡à¹ˆà¸¡à¸µà¸ªà¸´à¸—à¸˜à¸´à¹Œà¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£: à¸•à¹‰à¸­à¸‡à¹€à¸›à¹‡à¸™ Admin à¹€à¸—à¹ˆà¸²à¸™à¸±à¹‰à¸™");
  }
}

interface ActionResult {
  success: boolean;
  message: string;
}

// â”€â”€â”€ Action 1: Approve Registration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function approveRegistration(
  currentUid: string,
  registrationId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    // 1. Get registration data
    const regRef = adminDb.collection("team_registrations").doc(registrationId);
    const regDoc = await regRef.get();

    if (!regDoc.exists) {
      return { success: false, message: "à¹„à¸¡à¹ˆà¸žà¸šà¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¸™à¸µà¹‰à¹ƒà¸™à¸£à¸°à¸šà¸š" };
    }

    const regData = regDoc.data();
    if (!regData) {
      return { success: false, message: "à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹„à¸¡à¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡" };
    }

    if (regData.status === "Approved") {
      return { success: false, message: "à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¸™à¸µà¹‰à¹„à¸”à¹‰à¸£à¸±à¸šà¸à¸²à¸£à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¹à¸¥à¹‰à¸§" };
    }

    // 2. Use batch write for atomicity
    const batch = adminDb.batch();

    // Update registration status
    batch.update(regRef, { status: "Approved" });

    // Create club document
    const clubRef = adminDb.collection("clubs").doc();
    batch.set(clubRef, {
      name: regData.teamName ?? "",
      logo: regData.logoUrl ?? "",
      contactName: regData.managerName ?? "",
      contactPhone: regData.phone ?? "",
      status: "active",
      registrationId: registrationId,
      approvedAt: FieldValue.serverTimestamp(),
      playerCount: 0,
    });

    await batch.commit();

    return {
      success: true,
      message: `à¸­à¸™à¸¸à¸¡à¸±à¸•à¸´à¸—à¸µà¸¡ "${regData.teamName}" à¸ªà¸³à¹€à¸£à¹‡à¸ˆ à¸ªà¹‚à¸¡à¸ªà¸£à¸–à¸¹à¸à¸ªà¸£à¹‰à¸²à¸‡à¸­à¸±à¸•à¹‚à¸™à¸¡à¸±à¸•à¸´`,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ Action 2: Reject Registration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function rejectRegistration(
  currentUid: string,
  registrationId: string,
  reason?: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const regRef = adminDb.collection("team_registrations").doc(registrationId);
    const regDoc = await regRef.get();

    if (!regDoc.exists) {
      return { success: false, message: "à¹„à¸¡à¹ˆà¸žà¸šà¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¸™à¸µà¹‰à¹ƒà¸™à¸£à¸°à¸šà¸š" };
    }

    const updateData: Record<string, string> = { status: "Rejected" };
    if (reason?.trim()) {
      updateData.rejectionReason = reason.trim();
    }

    await regRef.update(updateData);

    return {
      success: true,
      message: "à¸›à¸à¸´à¹€à¸ªà¸˜à¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢à¹à¸¥à¹‰à¸§",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ Action 3: Update Club â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function updateClub(
  currentUid: string,
  clubId: string,
  data: { playerCount?: number; status?: "active" | "inactive" }
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const clubRef = adminDb.collection("clubs").doc(clubId);
    const clubDoc = await clubRef.get();

    if (!clubDoc.exists) {
      return { success: false, message: "à¹„à¸¡à¹ˆà¸žà¸šà¸ªà¹‚à¸¡à¸ªà¸£à¸™à¸µà¹‰à¹ƒà¸™à¸£à¸°à¸šà¸š" };
    }

    const updatePayload: Record<string, string | number> = {};
    if (data.playerCount !== undefined) updatePayload.playerCount = data.playerCount;
    if (data.status !== undefined) updatePayload.status = data.status;

    await clubRef.update(updatePayload);

    return {
      success: true,
      message: "à¸­à¸±à¸›à¹€à¸”à¸•à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¹‚à¸¡à¸ªà¸£à¸ªà¸³à¹€à¸£à¹‡à¸ˆ",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ Action 4: Delete Team Registration + Club + Group refs â”€â”€â”€â”€
export async function deleteTeamRegistration(
  currentUid: string,
  registrationId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const regRef = adminDb.collection("team_registrations").doc(registrationId);
    const regDoc = await regRef.get();

    if (!regDoc.exists) {
      return { success: false, message: "à¹„à¸¡à¹ˆà¸žà¸šà¹ƒà¸šà¸ªà¸¡à¸±à¸„à¸£à¸™à¸µà¹‰à¹ƒà¸™à¸£à¸°à¸šà¸š" };
    }

    const batch = adminDb.batch();

    // 1. Delete the registration
    batch.delete(regRef);

    // 2. Find and delete associated club (if any)
    const clubSnap = await adminDb
      .collection("clubs")
      .where("registrationId", "==", registrationId)
      .get();

    const clubIds: string[] = [];
    clubSnap.docs.forEach((clubDoc) => {
      clubIds.push(clubDoc.id);
      batch.delete(clubDoc.ref);
    });

    // 3. Remove club IDs from any group's teamIds array
    if (clubIds.length > 0) {
      const groupsSnap = await adminDb.collection("groups").get();
      groupsSnap.docs.forEach((groupDoc) => {
        const teamIds = (groupDoc.data().teamIds as string[]) ?? [];
        const filtered = teamIds.filter((id) => !clubIds.includes(id));
        if (filtered.length !== teamIds.length) {
          batch.update(groupDoc.ref, { teamIds: filtered });
        }
      });

      // 4. Delete standings for these clubs
      for (const clubId of clubIds) {
        const standingsSnap = await adminDb
          .collection("standings")
          .where("clubId", "==", clubId)
          .get();
        standingsSnap.docs.forEach((d) => batch.delete(d.ref));
      }

      // 5. Delete matches involving these clubs
      for (const clubId of clubIds) {
        const [homeSnap, awaySnap] = await Promise.all([
          adminDb.collection("matches").where("homeTeamId", "==", clubId).get(),
          adminDb.collection("matches").where("awayTeamId", "==", clubId).get(),
        ]);
        homeSnap.docs.forEach((d) => batch.delete(d.ref));
        awaySnap.docs.forEach((d) => batch.delete(d.ref));
      }
    }

    await batch.commit();

    return {
      success: true,
      message: "à¸¥à¸šà¸—à¸µà¸¡à¹à¸¥à¸°à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸—à¸µà¹ˆà¹€à¸à¸µà¹ˆà¸¢à¸§à¸‚à¹‰à¸­à¸‡à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢à¹à¸¥à¹‰à¸§",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ Action 5: Delete Club directly â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function deleteClub(
  currentUid: string,
  clubId: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    const clubRef = adminDb.collection("clubs").doc(clubId);
    const clubDoc = await clubRef.get();

    if (!clubDoc.exists) {
      return { success: false, message: "à¹„à¸¡à¹ˆà¸žà¸šà¸ªà¹‚à¸¡à¸ªà¸£à¸™à¸µà¹‰à¹ƒà¸™à¸£à¸°à¸šà¸š" };
    }

    const batch = adminDb.batch();

    // 1. Delete club
    batch.delete(clubRef);

    // 2. Delete associated registration (if any)
    const regId = clubDoc.data()?.registrationId as string | undefined;
    if (regId) {
      const regRef = adminDb.collection("team_registrations").doc(regId);
      const regDoc = await regRef.get();
      if (regDoc.exists) batch.delete(regRef);
    }

    // 3. Remove from groups
    const groupsSnap = await adminDb.collection("groups").get();
    groupsSnap.docs.forEach((groupDoc) => {
      const teamIds = (groupDoc.data().teamIds as string[]) ?? [];
      if (teamIds.includes(clubId)) {
        batch.update(groupDoc.ref, { teamIds: teamIds.filter((id) => id !== clubId) });
      }
    });

    // 4. Delete standings
    const standingsSnap = await adminDb
      .collection("standings")
      .where("clubId", "==", clubId)
      .get();
    standingsSnap.docs.forEach((d) => batch.delete(d.ref));

    // 5. Delete matches
    const [homeSnap, awaySnap] = await Promise.all([
      adminDb.collection("matches").where("homeTeamId", "==", clubId).get(),
      adminDb.collection("matches").where("awayTeamId", "==", clubId).get(),
    ]);
    homeSnap.docs.forEach((d) => batch.delete(d.ref));
    awaySnap.docs.forEach((d) => batch.delete(d.ref));

    await batch.commit();

    return {
      success: true,
      message: "à¸¥à¸šà¸ªà¹‚à¸¡à¸ªà¸£à¹à¸¥à¸°à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸—à¸µà¹ˆà¹€à¸à¸µà¹ˆà¸¢à¸§à¸‚à¹‰à¸­à¸‡à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¹€à¸£à¸µà¸¢à¸šà¸£à¹‰à¸­à¸¢à¹à¸¥à¹‰à¸§",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

``n

## File: src/app/actions/admin/userActions.ts

`$lang
"use server";

import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import type { ActionResult, UserRole, EditUserPayload } from "@/types/user";
import { FieldValue } from "firebase-admin/firestore";

// â”€â”€â”€ Helper: Verify caller is admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function verifyAdmin(currentUid: string): Promise<void> {
  const userDoc = await adminDb.collection("users").doc(currentUid).get();
  if (!userDoc.exists || userDoc.data()?.role !== "admin") {
    throw new Error("à¹„à¸¡à¹ˆà¸¡à¸µà¸ªà¸´à¸—à¸˜à¸´à¹Œà¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£: à¸•à¹‰à¸­à¸‡à¹€à¸›à¹‡à¸™ Admin à¹€à¸—à¹ˆà¸²à¸™à¸±à¹‰à¸™");
  }
}

function assertNotSelf(currentUid: string, targetUid: string): void {
  if (currentUid === targetUid) {
    throw new Error("à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¸”à¸³à¹€à¸™à¸´à¸™à¸à¸²à¸£à¸à¸±à¸šà¸šà¸±à¸à¸Šà¸µà¸•à¸±à¸§à¹€à¸­à¸‡à¹„à¸”à¹‰");
  }
}

// â”€â”€â”€ Action 1: Change User Role â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function changeUserRole(
  currentUid: string,
  targetUid: string,
  newRole: UserRole
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);
    assertNotSelf(currentUid, targetUid);

    await adminDb.collection("users").doc(targetUid).update({
      role: newRole,
    });

    return {
      success: true,
      message: `à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™ Role à¹€à¸›à¹‡à¸™ "${newRole}" à¸ªà¸³à¹€à¸£à¹‡à¸ˆ`,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ Action 2: Ban User â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function banUser(
  currentUid: string,
  targetUid: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);
    assertNotSelf(currentUid, targetUid);

    // Disable Firebase Auth account
    await adminAuth.updateUser(targetUid, { disabled: true });

    // Update Firestore
    await adminDb.collection("users").doc(targetUid).update({
      banned: true,
    });

    return {
      success: true,
      message: "à¹à¸šà¸™à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸ªà¸³à¹€à¸£à¹‡à¸ˆ à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸ˆà¸°à¹„à¸¡à¹ˆà¸ªà¸²à¸¡à¸²à¸£à¸–à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¹„à¸”à¹‰",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ Action 3: Unban User â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function unbanUser(
  currentUid: string,
  targetUid: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);
    assertNotSelf(currentUid, targetUid);

    // Enable Firebase Auth account
    await adminAuth.updateUser(targetUid, { disabled: false });

    // Update Firestore
    await adminDb.collection("users").doc(targetUid).update({
      banned: false,
    });

    return {
      success: true,
      message: "à¸›à¸¥à¸”à¹à¸šà¸™à¸ªà¸³à¹€à¸£à¹‡à¸ˆ à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸ªà¸²à¸¡à¸²à¸£à¸–à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¹„à¸”à¹‰à¹à¸¥à¹‰à¸§",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ Action 4: Edit User â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function editUser(
  currentUid: string,
  targetUid: string,
  data: EditUserPayload
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);

    // Validate
    if (!data.displayName.trim()) {
      return { success: false, message: "à¸Šà¸·à¹ˆà¸­à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸•à¹‰à¸­à¸‡à¹„à¸¡à¹ˆà¹€à¸›à¹‡à¸™à¸„à¹ˆà¸²à¸§à¹ˆà¸²à¸‡" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, message: "à¸£à¸¹à¸›à¹à¸šà¸šà¸­à¸µà¹€à¸¡à¸¥à¹„à¸¡à¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡" };
    }

    // Update Firebase Auth profile
    await adminAuth.updateUser(targetUid, {
      displayName: data.displayName.trim(),
      email: data.email.trim(),
    });

    // Update Firestore
    await adminDb.collection("users").doc(targetUid).update({
      displayName: data.displayName.trim(),
      email: data.email.trim(),
    });

    return {
      success: true,
      message: "à¸­à¸±à¸›à¹€à¸”à¸•à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸ªà¸³à¹€à¸£à¹‡à¸ˆ",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

// â”€â”€â”€ Action 5: Delete User â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function deleteUser(
  currentUid: string,
  targetUid: string
): Promise<ActionResult> {
  try {
    await verifyAdmin(currentUid);
    assertNotSelf(currentUid, targetUid);

    // 1. Delete subcollection: orders (query top-level by userId)
    const ordersSnap = await adminDb
      .collection("orders")
      .where("userId", "==", targetUid)
      .get();
    const orderBatch = adminDb.batch();
    ordersSnap.docs.forEach((doc) => orderBatch.delete(doc.ref));
    if (!ordersSnap.empty) await orderBatch.commit();

    // 2. Delete subcollection: team_registrations (query by email)
    const userDoc = await adminDb.collection("users").doc(targetUid).get();
    const userEmail = userDoc.data()?.email as string | undefined;
    if (userEmail) {
      const regsSnap = await adminDb
        .collection("team_registrations")
        .where("email", "==", userEmail)
        .get();
      const regBatch = adminDb.batch();
      regsSnap.docs.forEach((doc) => regBatch.delete(doc.ref));
      if (!regsSnap.empty) await regBatch.commit();
    }

    // 3. Delete Firestore user document
    await adminDb.collection("users").doc(targetUid).delete();

    // 4. Delete Firebase Auth account
    await adminAuth.deleteUser(targetUid);

    return {
      success: true,
      message: "à¸¥à¸šà¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸­à¸­à¸à¸ˆà¸²à¸à¸£à¸°à¸šà¸šà¸ªà¸³à¹€à¸£à¹‡à¸ˆ",
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "à¹€à¸à¸´à¸”à¸‚à¹‰à¸­à¸œà¸´à¸”à¸žà¸¥à¸²à¸”";
    return { success: false, message: msg };
  }
}

``n

## File: src/types/bracket.ts

`$lang
import type { Timestamp } from "firebase/firestore";

export interface BracketMatch {
  id: string;
  competitionId: string;
  round: number;
  roundName: "RO16" | "QF" | "SF" | "F";
  position: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  winnerId: string;
  status: "scheduled" | "live" | "completed";
  date: Timestamp | string; // Support both Firestore Timestamp and serialized ISO string
  venue: string;
  nextMatchId: string;
}

``n

## File: src/types/club.ts

`$lang
import type { Timestamp } from "firebase/firestore";

export interface Club {
  id: string;
  name: string;
  logo: string;
  contactName: string;
  contactPhone: string;
  status: "active" | "inactive";
  registrationId: string;
  approvedAt: Timestamp | string;
  playerCount: number;
}

``n

## File: src/types/match.ts

`$lang
import type { Timestamp } from "firebase/firestore";

export interface Match {
  id: string;
  competitionId: string;
  groupId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: Timestamp;
  venue: string;
  status: "scheduled" | "live" | "completed" | "postponed";
  round: "group" | "knockout";
}

export interface Standing {
  competitionId: string;
  groupId: string;
  clubId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

``n

## File: src/types/news.ts

`$lang
import type { Timestamp } from "firebase/firestore";

export interface News {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  category: "news" | "highlight";
  videoUrl?: string;
  publishedAt: Timestamp | string; // Support both Firestore Timestamp and serialized ISO string
  status: "draft" | "published";
  authorId: string;
  authorName: string;
}

``n

## File: src/types/tournament.ts

`$lang
export interface Group {
  id: string;
  competitionId: string;
  name: string;
  teamIds: string[];
}

export interface CompetitionForDraw {
  id: string;
  name: string;
  status: "Open" | "Closed";
  teamQuota: number;
  numberOfGroups: number;
  teamsPerGroup: number;
}

``n

## File: src/types/user.ts

`$lang
import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: "admin" | "user";
  banned: boolean;
  createdAt: Timestamp;
}

export interface UserOrder {
  id: string;
  items: string[];
  totalAmount: number;
  status: "pending" | "paid" | "cancelled";
  createdAt: Timestamp;
}

export interface UserTeamRegistration {
  id: string;
  teamName: string;
  packageName: string;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Timestamp;
}

export type UserRole = "admin" | "user";

export interface EditUserPayload {
  displayName: string;
  email: string;
}

export interface ActionResult {
  success: boolean;
  message: string;
}

``n

## File: src/services/dataService.ts

`$lang
// Data Service
// Supports Firebase Firestore & Storage

import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp
} from "firebase/firestore";

export interface Competition {
  id: string;
  name: string;
  type: string;
  maxPlayers: number;
  maxAge: string | number;
  teamQuota: number;
  entryFee: number;
  startDate: string;
  endDate: string;
  status: "Open" | "Closed";
  createdAt?: string;
  numberOfGroups?: number;
  teamsPerGroup?: number;
}

export interface TeamRegistration {
  id: string;
  competitionId: string;
  teamName: string;
  managerName: string;
  phone: string;
  email: string;
  logoUrl: string;
  slipUrl: string;
  status: "Pending" | "Approved" | "Rejected";
  submittedAt: string;
}

export interface Match {
  id: string;
  date: string;
  time?: string;
  home?: string;
  away?: string;
  venue?: string;
  teamA?: string;
  teamB?: string;
  score: string | null;
  status: "upcoming" | "completed";
}

export interface Photo {
  id: string;
  url: string;
  price: number;
}

export interface GalleryAlbum {
  albumId: string;
  matchId: string;
  title: string;
  date: string;
  coverUrl: string;
  isProtected: boolean;
  password?: string;
  photos: Photo[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  unit?: string;
  description?: string;
  features: string[];
  status: "Active" | "Inactive";
  popular?: boolean;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  region: string;
  since: number;
  points: number;
  logoColor: string;
  bgColor: string;
  logoUrl?: string;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  competition?: string;
  status?: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl: string;
  type: "News" | "Highlight" | "Announcement" | "Gallery";
  publishedAt: string;
  status: "draft" | "published";
  createdAt?: any;
}

export const DataService = {
  // --- TEAMS ---
  getTeams: async (): Promise<Team[]> => {
    try {
      const snapshot = await getDocs(query(collection(db, "teams"), orderBy("points", "desc")));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team));
    } catch (error) {
      console.error("Firebase getTeams Error:", error);
      return [];
    }
  },

  createTeam: async (teamData: Partial<Team>): Promise<boolean> => {
    try {
      await addDoc(collection(db, "teams"), {
        ...teamData,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Firebase createTeam Error:", error);
      return false;
    }
  },

  // --- MATCHES ---
  getMatches: async (): Promise<Match[]> => {
    try {
      const snapshot = await getDocs(query(collection(db, "matches"), orderBy("date", "desc")));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match));
    } catch (error) {
      console.error("Firebase getMatches Error:", error);
      return [];
    }
  },

  // --- GALLERY ---
  getGalleryAlbums: async (): Promise<GalleryAlbum[]> => {
    try {
      const snapshot = await getDocs(query(collection(db, "albums"), orderBy("date", "desc")));
      return snapshot.docs.map(d => ({ albumId: d.id, ...d.data() } as GalleryAlbum));
    } catch (error) {
      console.error("Firebase getGalleryAlbums Error:", error);
      return [];
    }
  },

  getAlbumById: async (albumId: string): Promise<GalleryAlbum | undefined> => {
    try {
      const docSnap = await getDoc(doc(db, "albums", albumId));
      if (docSnap.exists()) return { albumId: docSnap.id, ...docSnap.data() } as GalleryAlbum;
    } catch (error) {
      console.error("Firebase getAlbumById Error:", error);
    }
    return undefined;
  },

  createAlbum: async (albumData: Partial<GalleryAlbum>): Promise<boolean> => {
    try {
      await addDoc(collection(db, "albums"), { 
        ...albumData, 
        photos: albumData.photos || [],
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Firebase createAlbum Error:", error);
      return false;
    }
  },

  deleteAlbum: async (albumId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "albums", albumId));
      return true;
    } catch (error) {
      console.error("Firebase deleteAlbum Error:", error);
      return false;
    }
  },

  // --- SHOP (Products) ---
  getProducts: async (): Promise<Product[]> => {
    try {
      const snapshot = await getDocs(collection(db, "products"));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    } catch (error) {
      console.error("Firebase getProducts Error:", error);
      return [];
    }
  },

  createProduct: async (productData: Partial<Product>): Promise<boolean> => {
    try {
      await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Firebase createProduct Error:", error);
      return false;
    }
  },

  updateProduct: async (productId: string, data: Partial<Product>): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "products", productId), data);
      return true;
    } catch (error) {
      console.error("Firebase updateProduct Error:", error);
      return false;
    }
  },

  deleteProduct: async (productId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "products", productId));
      return true;
    } catch (error) {
      console.error("Firebase deleteProduct Error:", error);
      return false;
    }
  },

  // --- PACKAGES ---
  getPackages: async (): Promise<Package[]> => {
    try {
      const snapshot = await getDocs(collection(db, "packages"));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Package));
    } catch (error) {
      console.error("Firebase getPackages Error:", error);
      return [];
    }
  },

  createPackage: async (pkgData: Partial<Package>): Promise<boolean> => {
    try {
      await addDoc(collection(db, "packages"), {
        ...pkgData,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Firebase createPackage Error:", error);
      return false;
    }
  },

  updatePackage: async (pkgId: string, data: Partial<Package>): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "packages", pkgId), data);
      return true;
    } catch (error) {
      console.error("Firebase updatePackage Error:", error);
      return false;
    }
  },

  deletePackage: async (pkgId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "packages", pkgId));
      return true;
    } catch (error) {
      console.error("Firebase deletePackage Error:", error);
      return false;
    }
  },

  // --- NEWS ---
  getNews: async (includeDrafts = false): Promise<News[]> => {
    try {
      const q = includeDrafts 
        ? query(collection(db, "news"), orderBy("publishedAt", "desc"))
        : query(collection(db, "news"), orderBy("publishedAt", "desc")); // In production, filter by status === 'published'
      
      const snapshot = await getDocs(q);
      const news = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as News));
      return includeDrafts ? news : news.filter(n => n.status === "published");
    } catch (error) {
      console.error("Firebase getNews Error:", error);
      return [];
    }
  },

  createNews: async (newsData: Partial<News>): Promise<boolean> => {
    try {
      await addDoc(collection(db, "news"), {
        ...newsData,
        createdAt: serverTimestamp(),
        publishedAt: newsData.publishedAt || new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error("Firebase createNews Error:", error);
      return false;
    }
  },

  updateNews: async (newsId: string, data: Partial<News>): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "news", newsId), data);
      return true;
    } catch (error) {
      console.error("Firebase updateNews Error:", error);
      return false;
    }
  },

  deleteNews: async (newsId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "news", newsId));
      return true;
    } catch (error) {
      console.error("Firebase deleteNews Error:", error);
      return false;
    }
  },

  // --- ORDERS ---
  getOrders: async (count?: number): Promise<any[]> => {
    try {
      const q = count 
        ? query(collection(db, "orders"), orderBy("date", "desc"), limit(count))
        : query(collection(db, "orders"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("Firebase getOrders Error:", error);
      return [];
    }
  },

  updateOrder: async (orderId: string, data: any): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "orders", orderId), data);
      return true;
    } catch (error) {
      console.error("Firebase updateOrder Error:", error);
      return false;
    }
  },

  submitPaymentSlip: async (orderDetails: any, slipUrl: string): Promise<boolean> => {
    try {
      await addDoc(collection(db, "orders"), { 
        ...orderDetails, 
        slipUrl, 
        status: "Pending", 
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Firebase submitPayment Error:", error);
      return false;
    }
  },

  // --- COMPETITIONS ---
  getCompetitions: async (): Promise<Competition[]> => {
    try {
      const snapshot = await getDocs(query(collection(db, "competitions"), orderBy("createdAt", "desc")));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Competition));
    } catch (error) {
      console.error("Firebase getCompetitions Error:", error);
      return [];
    }
  },

  createCompetition: async (compData: Partial<Competition>): Promise<boolean> => {
    try {
      await addDoc(collection(db, "competitions"), {
        ...compData,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Firebase createCompetition Error:", error);
      return false;
    }
  },

  updateCompetition: async (compId: string, data: Partial<Competition>): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "competitions", compId), data);
      return true;
    } catch (error) {
      console.error("Firebase updateCompetition Error:", error);
      return false;
    }
  },

  deleteCompetition: async (compId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "competitions", compId));
      return true;
    } catch (error) {
      console.error("Firebase deleteCompetition Error:", error);
      return false;
    }
  },

  // --- TEAM REGISTRATIONS ---
  getRegistrations: async (): Promise<TeamRegistration[]> => {
    try {
      const snapshot = await getDocs(query(collection(db, "team_registrations"), orderBy("submittedAt", "desc")));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TeamRegistration));
    } catch (error) {
      console.error("Firebase getRegistrations Error:", error);
      return [];
    }
  },

  submitRegistration: async (regData: Partial<TeamRegistration>): Promise<boolean> => {
    try {
      await addDoc(collection(db, "team_registrations"), {
        ...regData,
        status: "Pending",
        submittedAt: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Firebase submitRegistration Error:", error);
      return false;
    }
  },

  updateRegistrationStatus: async (regId: string, status: "Pending" | "Approved" | "Rejected"): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "team_registrations", regId), { status });
      return true;
    } catch (error) {
      console.error("Firebase updateRegistrationStatus Error:", error);
      return false;
    }
  },
};






``n

## File: src/lib/firebase.ts

`$lang
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "build-time-mock-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "build-time-mock-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "build-time-mock-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "build-time-mock-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "build-time-mock-sender",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "build-time-mock-app",
};

// Static Environment Validation (Next.js requires static access for NEXT_PUBLIC vars)
const isConfigIncomplete = 
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
  !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
  !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
  !process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 
  !process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

if (isConfigIncomplete) {
  console.error("CRITICAL ERROR: Firebase Environment Variables are missing. Please check your .env.local");
}


// Initialize Firebase
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
export default app;


``n

## File: firestore.indexes.json

`$lang
{
  "indexes": [
    {
      "collectionGroup": "clubs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "news",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "news",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "publishedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "team_registrations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "competitionId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "groups",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "competitionId", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "competitionId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "competitionId", "order": "ASCENDING" },
        { "fieldPath": "groupId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "standings",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "competitionId", "order": "ASCENDING" },
        { "fieldPath": "groupId", "order": "ASCENDING" },
        { "fieldPath": "points", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "bracket_matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "competitionId", "order": "ASCENDING" },
        { "fieldPath": "round", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}

``n

## File: firestore.rules

`$lang
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Products, Packages, Gallery, News: Everyone can read, only Admin can write
    match /products/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /packages/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /albums/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /news/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Matches & Teams: Everyone can read, only Admin can write
    match /matches/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /teams/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Users: Owners and Admins can read/write
    // But users CANNOT modify their own role or banned status
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isAdmin();
      allow update: if isOwner(userId)
        && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'banned']);
      allow create: if isOwner(userId);
    }

    // Orders: Owners and Admins
    match /orders/{orderId} {
      allow create: if isSignedIn();
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isAdmin());
      allow update, delete: if isAdmin();
    }
    
    // Team Registrations
    match /team_registrations/{regId} {
      allow create: if true; // Allow public submission
      allow read: if isAdmin(); // Only admin can see all registrations
      allow update, delete: if isAdmin();
    }
    
    // Competitions
    match /competitions/{compId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}

``n
