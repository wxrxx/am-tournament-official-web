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
  type: "11 คน",
  maxPlayers: 11,
  maxAge: "ไม่จำกัด",
  teamQuota: 16,
  entryFee: 0,
  startDate: "",
  endDate: "",
  status: "Open",
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
    if (!form.name?.trim()) { toast.error("กรุณากรอกชื่อรายการ"); return; }
    if (!form.startDate || !form.endDate) { toast.error("กรุณากรอกวันที่เปิด/ปิดรับสมัคร"); return; }
    setSaving(true);
    let ok = false;
    if (editTarget) {
      ok = await DataService.updateCompetition(editTarget.id, form);
    } else {
      ok = await DataService.createCompetition(form);
    }
    setSaving(false);
    if (ok) {
      toast.success(editTarget ? "แก้ไขรายการสำเร็จ" : "เพิ่มรายการสำเร็จ");
      setDialogOpen(false);
      fetch();
    } else {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
  };

  const handleToggle = async (comp: Competition) => {
    const newStatus = comp.status === "Open" ? "Closed" : "Open";
    const ok = await DataService.updateCompetition(comp.id, { status: newStatus });
    if (ok) {
      toast.success(`${newStatus === "Open" ? "เปิด" : "ปิด"}การรับสมัครแล้ว`);
      fetch();
    } else {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (comp: Competition) => {
    const result = await Swal.fire({
      title: "ลบรายการนี้?",
      text: `"${comp.name}" จะถูกลบออกถาวร ไม่สามารถกู้คืนได้`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
      background: "hsl(var(--card))",
      color: "hsl(var(--foreground))",
    });
    if (!result.isConfirmed) return;
    const ok = await DataService.deleteCompetition(comp.id);
    if (ok) {
      toast.success("ลบรายการสำเร็จ");
      fetch();
    } else {
      toast.error("เกิดข้อผิดพลาด");
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
            <h1 className="text-2xl font-bold tracking-tight">จัดการรายการแข่งขัน</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-11">เพิ่ม แก้ไข และควบคุมการรับสมัครแต่ละรายการ</p>
        </div>
        <Button onClick={openAdd} className="gap-2 bg-primary text-black hover:bg-primary/90">
          <Plus size={16} />
          เพิ่มรายการใหม่
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
              <p className="font-semibold text-foreground">ยังไม่มีรายการแข่งขัน</p>
              <p className="text-muted-foreground text-sm mt-1">คลิก &quot;เพิ่มรายการใหม่&quot; เพื่อเริ่มต้น</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">รายการ</TableHead>
                <TableHead className="font-semibold text-foreground">ประเภท</TableHead>
                <TableHead className="font-semibold text-foreground text-center">ผู้เล่น</TableHead>
                <TableHead className="font-semibold text-foreground text-center">อายุสูงสุด</TableHead>
                <TableHead className="font-semibold text-foreground text-center">โควตาทีม</TableHead>
                <TableHead className="font-semibold text-foreground text-right">ค่าสมัคร</TableHead>
                <TableHead className="font-semibold text-foreground text-center">สถานะ</TableHead>
                <TableHead className="font-semibold text-foreground text-center">วันที่ปิด</TableHead>
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
                  <TableCell className="text-right font-medium">฿{comp.entryFee?.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={comp.status === "Open"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-red-500/10 text-red-500 border-red-500/30"
                      }
                    >
                      {comp.status === "Open" ? "เปิดรับ" : "ปิดรับ"}
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
                        title={comp.status === "Open" ? "ปิดรับสมัคร" : "เปิดรับสมัคร"}
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
              {editTarget ? "แก้ไขรายการแข่งขัน" : "เพิ่มรายการแข่งขันใหม่"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-2">
            <div className="space-y-1.5">
              <Label>ชื่อรายการ <span className="text-red-500">*</span></Label>
              <Input
                placeholder="เช่น AM League Season 1"
                value={form.name || ""}
                onChange={(e) => field("name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>ประเภท</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.type || "11 คน"}
                  onChange={(e) => field("type", e.target.value)}
                >
                  <option value="7 คน">7 คน</option>
                  <option value="11 คน">11 คน</option>
                  <option value="อื่น ๆ">อื่น ๆ</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>จำนวนผู้เล่น/ทีม</Label>
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
                <Label>จำกัดอายุสูงสุด</Label>
                <Input
                  placeholder="เช่น 18 หรือ ไม่จำกัด"
                  value={form.maxAge || ""}
                  onChange={(e) => field("maxAge", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>จำนวนทีมที่รับ (Quota)</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.teamQuota || ""}
                  onChange={(e) => field("teamQuota", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>ค่าสมัคร (บาท)</Label>
              <Input
                type="number"
                min={0}
                value={form.entryFee || ""}
                onChange={(e) => field("entryFee", Number(e.target.value))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>วันที่เปิดรับสมัคร <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={form.startDate || ""}
                  onChange={(e) => field("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>วันที่ปิดรับสมัคร <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={form.endDate || ""}
                  onChange={(e) => field("endDate", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>สถานะ</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.status || "Open"}
                onChange={(e) => field("status", e.target.value as "Open" | "Closed")}
              >
                <option value="Open">เปิดรับสมัคร</option>
                <option value="Closed">ปิดรับสมัคร</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>ยกเลิก</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary text-black hover:bg-primary/90">
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
