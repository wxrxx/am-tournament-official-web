"use client";

import { useState, useEffect, useCallback } from "react";
import { DataService, TeamRegistration, Competition } from "@/services/dataService";
import { useAuth } from "@/context/AuthContext";
import { approveRegistration, rejectRegistration, deleteTeamRegistration } from "@/app/actions/admin/registrationActions";
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
  Users, CheckCircle2, XCircle, Clock, ExternalLink, Eye, Filter, Loader2, Trash2,
} from "lucide-react";
import { toast } from "sonner";

// ─── Status config ──────────────────────────────────────────────
const STATUS_MAP = {
  Pending:  { label: "รอตรวจสอบ",  cls: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: Clock },
  Approved: { label: "อนุมัติแล้ว", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", icon: CheckCircle2 },
  Rejected: { label: "ปฏิเสธแล้ว", cls: "bg-red-500/10 text-red-500 border-red-500/30", icon: XCircle },
} as const;

type StatusKey = keyof typeof STATUS_MAP;

// ─── Component ──────────────────────────────────────────────────
export default function AdminRegistrationsPage() {
  const { user } = useAuth();

  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | StatusKey>("all");

  // Detail dialog
  const [selected, setSelected] = useState<TeamRegistration | null>(null);
  // Approve confirm
  const [approveTarget, setApproveTarget] = useState<TeamRegistration | null>(null);
  const [approving, setApproving] = useState(false);
  // Reject confirm
  const [rejectTarget, setRejectTarget] = useState<TeamRegistration | null>(null);
  const [rejecting, setRejecting] = useState(false);
  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<TeamRegistration | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const PER_PAGE = 10;

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

  // Filter + paginate
  const filtered = filterStatus === "all"
    ? registrations
    : registrations.filter((r) => r.status === filterStatus);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  // ── Approve handler ─────────────────────────────────────────────
  const handleApprove = async () => {
    if (!approveTarget || !user) return;
    setApproving(true);
    const res = await approveRegistration(user.id, approveTarget.id);
    setApproving(false);
    setApproveTarget(null);
    setSelected(null);
    if (res.success) {
      toast.success(res.message);
      fetchAll();
    } else {
      toast.error(res.message);
    }
  };

  // ── Reject handler ──────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectTarget || !user) return;
    setRejecting(true);
    const res = await rejectRegistration(user.id, rejectTarget.id, rejectReason);
    setRejecting(false);
    setRejectTarget(null);
    setRejectReason("");
    setSelected(null);
    if (res.success) {
      toast.success(res.message);
      fetchAll();
    } else {
      toast.error(res.message);
    }
  };

  // ── Delete handler ──────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget || !user) return;
    setDeleting(true);
    const res = await deleteTeamRegistration(user.id, deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
    setSelected(null);
    if (res.success) {
      toast.success(res.message);
      fetchAll();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
              <Users size={16} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">จัดการใบสมัครทีม</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-11">ตรวจสอบและอนุมัติใบสมัครแต่ละรายการ</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-muted-foreground" />
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as "all" | StatusKey); setPage(0); }}
          >
            <option value="all">ทุกสถานะ ({registrations.length})</option>
            <option value="Pending">รอตรวจสอบ ({registrations.filter(r => r.status === "Pending").length})</option>
            <option value="Approved">อนุมัติแล้ว ({registrations.filter(r => r.status === "Approved").length})</option>
            <option value="Rejected">ปฏิเสธแล้ว ({registrations.filter(r => r.status === "Rejected").length})</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {(["Pending", "Approved", "Rejected"] as const).map((s) => {
          const cfg = STATUS_MAP[s];
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
                {filterStatus !== "all" ? "ลองเปลี่ยนตัวกรองสถานะ" : "รอผู้ใช้ส่งใบสมัครเข้ามา"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">ชื่อทีม</TableHead>
                  <TableHead className="font-semibold text-foreground">ผู้จัดการ</TableHead>
                  <TableHead className="font-semibold text-foreground">รายการ</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">สถานะ</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">วันสมัคร</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((reg) => {
                  const cfg = STATUS_MAP[reg.status];
                  return (
                    <TableRow key={reg.id} className="border-border/40 hover:bg-muted/30" style={{ transition: "background-color 150ms" }}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {reg.logoUrl ? (
                            <img src={reg.logoUrl} alt={reg.teamName} className="w-8 h-8 rounded-full object-cover border border-border/40" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                              {reg.teamName?.slice(0, 2)}
                            </div>
                          )}
                          <span>{reg.teamName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{reg.managerName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{compName(reg.competitionId)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cfg.cls}>{cfg.label}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground text-sm">
                        {reg.submittedAt ? new Date(reg.submittedAt).toLocaleDateString("th-TH") : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(reg)}>
                            <Eye size={15} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300" onClick={() => setDeleteTarget(reg)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/40">
                <p className="text-sm text-muted-foreground">
                  แสดง {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} จาก {filtered.length}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    ก่อนหน้า
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                    ถัดไป
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Dialog ────────────────────────────────────────────── */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border/40">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">รายละเอียดใบสมัคร</DialogTitle>
          </DialogHeader>
          {selected && (() => {
            const cfg = STATUS_MAP[selected.status];
            return (
              <div className="space-y-6 py-2">
                {/* Team header */}
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
                    <Badge variant="outline" className={cfg.cls}>{cfg.label}</Badge>
                  </div>
                </div>

                {/* Info grid */}
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
                </div>

                {/* Slip */}
                {selected.slipUrl && (
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">สลิปการชำระเงิน</p>
                    <img src={selected.slipUrl} alt="slip" className="w-full max-h-56 object-contain rounded-lg border border-border/40 bg-muted" />
                    <a href={selected.slipUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink size={12} /> เปิดในหน้าใหม่
                    </a>
                  </div>
                )}

                {/* Actions */}
                {selected.status === "Pending" && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                      onClick={() => setApproveTarget(selected)}
                    >
                      <CheckCircle2 size={15} /> อนุมัติ
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10 gap-2"
                      onClick={() => { setRejectTarget(selected); setRejectReason(""); }}
                    >
                      <XCircle size={15} /> ปฏิเสธ
                    </Button>
                  </div>
                )}

                {/* Delete */}
                <Button
                  variant="outline"
                  className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 gap-2 mt-2"
                  onClick={() => setDeleteTarget(selected)}
                >
                  <Trash2 size={14} /> ลบทีมออกจากระบบ
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Approve Confirm ──────────────────────────────────────────── */}
      <AlertDialog open={!!approveTarget} onOpenChange={() => setApproveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันอนุมัติทีม?</AlertDialogTitle>
            <AlertDialogDescription>
              ทีม <strong>{approveTarget?.teamName}</strong> จะถูกเพิ่มเข้าระบบสโมสรอัตโนมัติ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approving}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleApprove}
              disabled={approving}
            >
              {approving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              อนุมัติ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Reject Confirm ───────────────────────────────────────────── */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>ปฏิเสธใบสมัคร</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              กรุณาระบุเหตุผลในการปฏิเสธทีม <strong>{rejectTarget?.teamName}</strong>
            </p>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">เหตุผล (ไม่บังคับ)</Label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="เช่น สลิปไม่ชัด, ข้อมูลไม่ครบ"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)} disabled={rejecting}>
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejecting}
            >
              {rejecting ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              ยืนยันปฏิเสธ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ───────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบทีม {deleteTarget?.teamName} ออกจากระบบ?</AlertDialogTitle>
            <AlertDialogDescription>
              ข้อมูลทั้งหมดจะหายถาวร รวมถึงสโมสร, ผลแบ่งสาย และผลการแข่งขันที่เกี่ยวข้อง
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={14} className="mr-2" />}
              ยืนยันลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
