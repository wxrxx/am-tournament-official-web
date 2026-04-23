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
      toast.error("ไม่สามารถโหลดข้อมูลสโมสรได้");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchClubs(); }, [fetchClubs]);

  const activeCount = clubs.filter((c) => c.status === "active").length;

  const filtered = clubs
    .filter((c) => filterStatus === "all" || c.status === filterStatus)
    .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // ── Edit handler ────────────────────────────────────────────────
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

  // ── Delete handler ──────────────────────────────────────────────
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
          <h1 className="text-2xl font-bold tracking-tight">จัดการสโมสร</h1>
        </div>
        <p className="text-muted-foreground text-sm pl-11">สโมสรที่ถูกสร้างจากการอนุมัติใบสมัครทีม</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/40 bg-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
            <Shield size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{clubs.length}</p>
            <p className="text-muted-foreground text-sm">ทั้งหมด</p>
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
            placeholder="ค้นหาชื่อสโมสร..."
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
          <option value="all">ทุกสถานะ</option>
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
              <p className="font-semibold text-foreground">ยังไม่มีสโมสร</p>
              <p className="text-muted-foreground text-sm mt-1">สโมสรจะถูกสร้างอัตโนมัติเมื่ออนุมัติใบสมัครทีม</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">สโมสร</TableHead>
                <TableHead className="font-semibold text-foreground">ผู้ติดต่อ</TableHead>
                <TableHead className="font-semibold text-foreground">เบอร์โทร</TableHead>
                <TableHead className="font-semibold text-foreground text-center">ผู้เล่น</TableHead>
                <TableHead className="font-semibold text-foreground text-center">สถานะ</TableHead>
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

      {/* ── Edit Dialog ──────────────────────────────────────────────── */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลสโมสร</DialogTitle>
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
                  <p className="text-xs text-muted-foreground">ไม่สามารถแก้ชื่อและโลโก้จากหน้านี้</p>
                </div>
              </div>

              {/* Editable fields */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">จำนวนผู้เล่น</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.playerCount}
                  onChange={(e) => setEditForm({ ...editForm, playerCount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">สถานะ</Label>
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
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>ยกเลิก</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ───────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบสโมสร {deleteTarget?.name} ออกจากระบบ?</AlertDialogTitle>
            <AlertDialogDescription>
              ข้อมูลทั้งหมดจะหายถาวร รวมถึงใบสมัคร, ผลแบ่งสาย และผลการแข่งขันที่เกี่ยวข้อง
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteClub}
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
