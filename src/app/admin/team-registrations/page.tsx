"use client";

import { useState, useEffect, useCallback } from "react";
import { DataService, TeamRegistration, Competition } from "@/services/dataService";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Filter,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

const statusConfig = {
  Pending:  { label: "รอตรวจสอบ", class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: Clock },
  Approved: { label: "อนุมัติแล้ว", class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", icon: CheckCircle2 },
  Rejected: { label: "ปฏิเสธแล้ว", class: "bg-red-500/10 text-red-500 border-red-500/30", icon: XCircle },
};

export default function AdminTeamRegistrationsPage() {
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterComp, setFilterComp] = useState("all");
  const [selected, setSelected] = useState<TeamRegistration | null>(null);
  const [actioning, setActioning] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [regs, comps] = await Promise.all([
      DataService.getRegistrations(),
      DataService.getCompetitions(),
    ]);
    setRegistrations(regs);
    setCompetitions(comps);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const compName = (id: string) =>
    competitions.find((c) => c.id === id)?.name ?? id;

  const filtered = filterComp === "all"
    ? registrations
    : registrations.filter((r) => r.competitionId === filterComp);

  const handleStatus = async (reg: TeamRegistration, status: "Approved" | "Rejected") => {
    if (status === "Approved") {
      const result = await Swal.fire({
        title: "อนุมัติทีมนี้?",
        html: `<b>${reg.teamName}</b> จะถูกเพิ่มเข้าหน้า <b>/teams</b> อัตโนมัติ`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "อนุมัติ",
        cancelButtonText: "ยกเลิก",
        background: "hsl(var(--card))",
        color: "hsl(var(--foreground))",
      });
      if (!result.isConfirmed) return;
    }

    setActioning(true);
    const ok = await DataService.updateRegistrationStatus(reg.id, status);

    if (ok && status === "Approved") {
      // Auto-create team entry
      const comp = competitions.find((c) => c.id === reg.competitionId);
      await DataService.createTeam({
        name: reg.teamName,
        shortName: reg.teamName.slice(0, 3).toUpperCase(),
        region: "ไม่ระบุ",
        since: new Date().getFullYear(),
        points: 0,
        logoColor: "#10b981",
        bgColor: "#064e3b",
        // extra fields for display
        ...({ logoUrl: reg.logoUrl, managerName: reg.managerName, managerPhone: reg.phone, managerEmail: reg.email, competition: comp?.name ?? reg.competitionId, status: "Active" } as any),
      });
    }

    setActioning(false);

    if (ok) {
      toast.success(status === "Approved" ? "อนุมัติสำเร็จ ทีมถูกเพิ่มใน /teams แล้ว" : "ปฏิเสธใบสมัครแล้ว");
      setSelected(null);
      fetchAll();
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
              <Users size={16} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">จัดการใบสมัครทีม</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-11">ตรวจสอบและอนุมัติใบสมัครแต่ละรายการแข่งขัน</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-muted-foreground" />
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={filterComp}
            onChange={(e) => setFilterComp(e.target.value)}
          >
            <option value="all">ทุกรายการ</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(["Pending", "Approved", "Rejected"] as const).map((s) => {
          const cfg = statusConfig[s];
          const count = registrations.filter((r) => r.status === s).length;
          const Icon = cfg.icon;
          return (
            <div key={s} className="rounded-xl border border-border/40 bg-card p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s === "Pending" ? "bg-yellow-500/10" : s === "Approved" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                <Icon size={20} className={s === "Pending" ? "text-yellow-500" : s === "Approved" ? "text-emerald-500" : "text-red-500"} />
              </div>
              <div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-muted-foreground text-sm">{cfg.label}</p>
              </div>
            </div>
          );
        })}
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
              <Users size={28} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">ยังไม่มีใบสมัคร</p>
              <p className="text-muted-foreground text-sm mt-1">
                {filterComp !== "all" ? "ลองเปลี่ยนตัวกรองรายการแข่งขัน" : "รอผู้ใช้ส่งใบสมัครเข้ามา"}
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">ชื่อทีม</TableHead>
                <TableHead className="font-semibold text-foreground">ผู้จัดการ</TableHead>
                <TableHead className="font-semibold text-foreground">เบอร์โทร</TableHead>
                <TableHead className="font-semibold text-foreground">รายการแข่งขัน</TableHead>
                <TableHead className="font-semibold text-foreground text-center">สถานะ</TableHead>
                <TableHead className="font-semibold text-foreground text-center">วันที่สมัคร</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((reg) => {
                const cfg = statusConfig[reg.status];
                return (
                  <TableRow key={reg.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium flex items-center gap-3">
                      {reg.logoUrl ? (
                        <img src={reg.logoUrl} alt={reg.teamName} className="w-8 h-8 rounded-full object-cover border border-border/40" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {reg.teamName?.slice(0, 2)}
                        </div>
                      )}
                      {reg.teamName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{reg.managerName}</TableCell>
                    <TableCell className="text-muted-foreground">{reg.phone}</TableCell>
                    <TableCell className="text-muted-foreground">{compName(reg.competitionId)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cfg.class}>
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground text-sm">
                      {reg.submittedAt ? new Date(reg.submittedAt).toLocaleDateString("th-TH") : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => setSelected(reg)}
                      >
                        <Eye size={15} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border/40 scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">รายละเอียดใบสมัคร</DialogTitle>
          </DialogHeader>
          {selected && (() => {
            const cfg = statusConfig[selected.status];
            return (
              <div className="space-y-6 py-2">
                {/* Team Logo */}
                <div className="flex items-center gap-4">
                  {selected.logoUrl ? (
                    <img src={selected.logoUrl} alt={selected.teamName} className="w-16 h-16 rounded-xl object-cover border border-border/40" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-xl font-bold">
                      {selected.teamName?.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-bold">{selected.teamName}</p>
                    <Badge variant="outline" className={cfg.class}>{cfg.label}</Badge>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">ผู้จัดการทีม</p>
                    <p className="font-medium">{selected.managerName}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">เบอร์โทร</p>
                    <p className="font-medium">{selected.phone}</p>
                  </div>
                  <div className="space-y-0.5 col-span-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">อีเมล</p>
                    <p className="font-medium">{selected.email}</p>
                  </div>
                  <div className="space-y-0.5 col-span-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">รายการแข่งขัน</p>
                    <p className="font-medium">{compName(selected.competitionId)}</p>
                  </div>
                  <div className="space-y-0.5 col-span-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">วันที่สมัคร</p>
                    <p className="font-medium">{new Date(selected.submittedAt).toLocaleString("th-TH")}</p>
                  </div>
                </div>

                {/* Slip */}
                {selected.slipUrl && (
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">สลิปการชำระเงิน</p>
                    <img src={selected.slipUrl} alt="slip" className="w-full max-h-56 object-contain rounded-lg border border-border/40 bg-muted" />
                    <a
                      href={selected.slipUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink size={12} /> เปิดในหน้าใหม่
                    </a>
                  </div>
                )}

                {/* Actions */}
                {selected.status === "Pending" && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                      onClick={() => handleStatus(selected, "Approved")}
                      disabled={actioning}
                    >
                      <CheckCircle2 size={15} />
                      อนุมัติ
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10 gap-2"
                      onClick={() => handleStatus(selected, "Rejected")}
                      disabled={actioning}
                    >
                      <XCircle size={15} />
                      ปฏิเสธ
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
