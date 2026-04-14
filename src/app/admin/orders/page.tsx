"use client";

import { useEffect, useState } from "react";
import { DataService } from "@/services/dataService";
import { Eye, CheckCircle, Clock, FileText, ExternalLink } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    DataService.getOrders().then(data => {
      setOrders(data);
      setIsLoading(false);
    });
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    // TODO: Future Supabase Integration - Update 'orders' table via DataService
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-foreground mb-2">รายการสั่งซื้อ</h1>
        <p className="text-sm text-muted-foreground">ตรวจสอบหลักฐานการโอนเงิน (PromptPay) และยืนยันรายการ</p>
      </div>

      <div className="bg-card border border-border/40 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[10px] uppercase text-muted-foreground tracking-widest border-b border-border/40 bg-muted/30">
              <tr>
                <th className="px-6 py-4 font-semibold">ออเดอร์</th>
                <th className="px-6 py-4 font-semibold">ชื่อลูกค้า</th>
                <th className="px-6 py-4 font-semibold">ประเภท</th>
                <th className="px-6 py-4 font-semibold">รายการ</th>
                <th className="px-6 py-4 font-semibold text-center">ยอดเงิน</th>
                <th className="px-6 py-4 font-semibold text-center">สถานะ</th>
                <th className="px-6 py-4 font-semibold text-right">สลิป</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-8 bg-muted/10"></td>
                  </tr>
                ))
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-5 font-mono text-[11px] text-muted-foreground">{o.id}</td>
                    <td className="px-6 py-5 font-medium text-foreground">{o.user}</td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] bg-muted px-2 py-1 rounded-sm border border-border/20">{o.type}</span>
                    </td>
                    <td className="px-6 py-5 text-muted-foreground">{o.item}</td>
                    <td className="px-6 py-5 text-center font-bold text-foreground">฿{o.price.toLocaleString()}</td>
                    <td className="px-6 py-5 text-center">
                      <button 
                        onClick={() => handleStatusChange(o.id, o.status === "Pending" ? "Confirmed" : "Pending")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                        o.status === "Confirmed" 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      }`}
                      >
                        {o.status === "Confirmed" ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {o.status === "Confirmed" ? "ยืนยันแล้ว" : "รอตรวจสอบ"}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 text-muted-foreground hover:text-primary transition-all flex items-center gap-1.5 ml-auto text-[11px] uppercase tracking-wider font-semibold">
                        <FileText size={14} />
                        สลิปโอนเงิน
                        <ExternalLink size={10} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4 text-[11px] text-muted-foreground italic">
        <Clock size={12} />
        อัปเดตข้อมูลล่าสุดเมื่อ: {new Date().toLocaleTimeString('th-TH')} น.
      </div>
    </div>
  );
}
