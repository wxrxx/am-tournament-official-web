"use client";

import { useEffect, useState } from "react";
import { DataService } from "@/services/dataService";
import { CheckCircle, Clock, FileText, ExternalLink, Loader2, RefreshCw } from "lucide-react";
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
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    const data = await DataService.getOrders();
    setOrders(data);
    setIsLoading(false);
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Pending" ? "Confirmed" : "Pending";
    const success = await DataService.updateOrder(id, { status: newStatus });
    if (success) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      toast.success(`อัปเดตสถานะเป็น ${newStatus === "Confirmed" ? "ยืนยันแล้ว" : "รอดำเนินการ"} สำเร็จ`);
    } else {
      toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

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
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">หลักฐาน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-12 w-full" /></TableCell>
                </TableRow>
              ))
            ) : orders.length > 0 ? (
              orders.map((o) => (
                <TableRow key={o.id} className="group hover:bg-muted/10 transition-colors">
                  <TableCell className="font-mono text-[11px] text-muted-foreground">
                    #{o.id.substring(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="font-bold text-sm text-foreground">{o.user || "ผู้ใช้ทั่วไป"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-tighter">
                      {o.type || "GENERAL"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{o.item}</TableCell>
                  <TableCell className="text-right font-bold text-sm">฿{(Number(o.price) || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-center">
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
                            คุณกำลังจะเปลี่ยนสถานะออเดอร์ #{o.id.substring(0, 8)} ของ {o.user || "ผู้ใช้ทั่วไป"} เป็น **{o.status === "Confirmed" ? "Pending (รอดำเนินการ)" : "Confirmed (ยืนยันแล้ว)"}**
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleStatusChange(o.id, o.status)}
                            className={o.status === "Pending" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                          >
                            ตกลง เปลี่ยนสถานะ
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                  <TableCell className="text-right">
                    {o.slipUrl ? (
                      <a
                        href={o.slipUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 text-[11px] text-muted-foreground hover:text-primary gap-1.5")}
                      >
                        <FileText size={14} />
                        VIEW SLIP
                      </a>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic px-3">NO SLIP</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground text-xs italic">
                  ไม่มีรายการสั่งซื้อที่ต้องการการตรวจสอบ
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
