"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  getOrders, 
  updateOrderStatus, 
  softDeleteOrder, 
  restoreOrder,
  type OrderData 
} from "@/app/actions/admin/orderActions";
import { CheckCircle, Clock, FileText, RefreshCw, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "deleted">("all");

  const loadOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    const r = await getOrders(user.id);
    if (r.success) {
      setOrders(r.orders);
    } else {
      toast.error(r.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (id: string, currentStatus: string) => {
    if (!user) return;
    const newStatus = currentStatus === "Pending" ? "Confirmed" : "Pending";
    const r = await updateOrderStatus(user.id, id, newStatus);
    if (r.success) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      toast.success(r.message);
    } else {
      toast.error(r.message);
    }
  };

  const handleSoftDelete = async (id: string) => {
    if (!user) return;
    const r = await softDeleteOrder(user.id, id);
    if (r.success) {
      toast.success(r.message);
      loadOrders();
    } else {
      toast.error(r.message);
    }
  };

  const handleRestore = async (id: string) => {
    if (!user) return;
    const r = await restoreOrder(user.id, id);
    if (r.success) {
      toast.success(r.message);
      loadOrders();
    } else {
      toast.error(r.message);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "all") return !o.deletedAt;
    return !!o.deletedAt;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">รายการสั่งซื้อ</h1>
          <p className="text-muted-foreground">ตรวจสอบหลักฐานการชำระเงินและจัดการสถานะออเดอร์ทั้งหมด</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadOrders} className="gap-2">
           <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
           รีเฟรชข้อมูล
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border/40 pb-px">
        <button
          onClick={() => setActiveTab("all")}
          className={cn(
            "pb-2 text-sm font-semibold transition-colors relative",
            activeTab === "all" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          ทั้งหมด
          {activeTab === "all" && (
            <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("deleted")}
          className={cn(
            "pb-2 text-sm font-semibold transition-colors relative",
            activeTab === "deleted" ? "text-destructive" : "text-muted-foreground hover:text-destructive"
          )}
        >
          ถูกลบ
          {activeTab === "deleted" && (
            <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-destructive" />
          )}
        </button>
      </div>

      <div className="rounded-sm border border-border/40 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">ออเดอร์ ID</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">ชื่อลูกค้า</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">ประเภท</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">รายการ</TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">ยอดเงิน</TableHead>
              <TableHead className="text-center uppercase tracking-widest text-[10px] font-bold">สถานะ</TableHead>
              <TableHead className="text-center uppercase tracking-widest text-[10px] font-bold">หลักฐาน</TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}><Skeleton className="h-12 w-full" /></TableCell>
                </TableRow>
              ))
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((o) => (
                <TableRow key={o.id} className="group hover:bg-muted/10 transition-colors">
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    #{o.id.substring(0, 8).toUpperCase()}
                    {o.deletedAt && (
                      <div className="text-[9px] text-destructive mt-1">ลบเมื่อ: {new Date(o.deletedAt).toLocaleDateString('th-TH')}</div>
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-sm text-foreground">{o.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-tighter">
                      {o.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{o.item}</TableCell>
                  <TableCell className="text-right font-bold text-sm">฿{Number(o.price).toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    {activeTab === "deleted" ? (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">DELETED</Badge>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger
                          className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                            o.status === "Confirmed" 
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" 
                              : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
                          }`}
                        >
                          {o.status === "Confirmed" ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {o.status === "Confirmed" ? "Confirmed" : "Pending"}
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>เปลี่ยนสถานะออเดอร์?</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณกำลังจะเปลี่ยนสถานะออเดอร์ #{o.id.substring(0, 8)} ของ {o.user} เป็น **{o.status === "Confirmed" ? "Pending (รอดำเนินการ)" : "Confirmed (ยืนยันแล้ว)"}**
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleStatusChange(o.id, o.status)}
                              className={o.status === "Pending" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                            >
                              ตกลง เปลี่ยนสถานะ
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {o.slipUrl ? (
                      <a
                        href={o.slipUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-[11px] text-muted-foreground hover:text-primary gap-1.5")}
                      >
                        <FileText size={14} />
                        VIEW
                      </a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">NO SLIP</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {activeTab === "all" ? (
                      <AlertDialog>
                        <AlertDialogTrigger
                          className="inline-flex items-center justify-center w-8 h-8 rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ลบคำสั่งซื้อนี้?</AlertDialogTitle>
                            <AlertDialogDescription>
                              คำสั่งซื้อจะถูกย้ายไปที่แท็บ "ถูกลบ" และสามารถกู้คืนได้ในภายหลัง
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleSoftDelete(o.id)}
                              className="bg-destructive hover:bg-destructive/90 text-white"
                            >
                              ยืนยันการลบ
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(o.id)}
                        className="h-8 text-[11px] font-bold text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 gap-1.5 uppercase tracking-widest"
                      >
                        <RotateCcw size={14} />
                        กู้คืน
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center text-muted-foreground text-xs italic">
                  {activeTab === "all" ? "ไม่มีรายการสั่งซื้อ" : "ไม่มีรายการที่ถูกลบ"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">
        <Clock size={12} className="text-primary" />
        Last sync: {new Date().toLocaleTimeString('th-TH')} // Secure Transaction Logged
      </div>
    </div>
  );
}
