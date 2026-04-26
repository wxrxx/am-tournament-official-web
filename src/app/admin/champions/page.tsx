"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getChampions, addChampion, updateChampion, deleteChampion,
} from "@/app/actions/admin/championActions";
import type { Champion } from "@/app/actions/admin/championActions";
import { getCompetitions } from "@/app/actions/admin/matchActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Trophy, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CompItem { id: string; name: string; status: string; }

export default function AdminChampionsPage() {
  const { user } = useAuth();
  const [champions, setChampions] = useState<Champion[]>([]);
  const [competitions, setCompetitions] = useState<CompItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [compId, setCompId] = useState("");
  const [compName, setCompName] = useState("");
  const [season, setSeason] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [champion, setChampion] = useState("");
  const [runnerUp, setRunnerUp] = useState("");
  const [thirdPlace, setThirdPlace] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [cr, comps] = await Promise.all([
      getChampions(user.id),
      getCompetitions(user.id),
    ]);
    if (cr.success) setChampions(cr.champions);
    if (comps.success) setCompetitions(comps.competitions);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setEditingId(null); setCompId(""); setCompName(""); setSeason("");
    setYear(new Date().getFullYear()); setChampion(""); setRunnerUp(""); setThirdPlace("");
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (c: Champion) => {
    setEditingId(c.id); setCompId(c.competitionId); setCompName(c.competitionName);
    setSeason(c.season); setYear(c.year); setChampion(c.champion);
    setRunnerUp(c.runnerUp); setThirdPlace(c.thirdPlace); setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!compName.trim() || !champion.trim()) { toast.error("กรุณากรอกชื่อรายการและชื่อทีมแชมป์"); return; }
    setSaving(true);
    const data: Omit<Champion, "id"> = {
      competitionId: compId, competitionName: compName.trim(),
      season: season.trim(), year, champion: champion.trim(),
      runnerUp: runnerUp.trim(), thirdPlace: thirdPlace.trim(),
    };
    const r = editingId
      ? await updateChampion(user.id, editingId, data)
      : await addChampion(user.id, data);
    setSaving(false);
    if (r.success) { toast.success(r.message); setDialogOpen(false); load(); }
    else toast.error(r.message);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!confirm("ลบทำเนียบแชมป์นี้?")) return;
    const r = await deleteChampion(user.id, id);
    if (r.success) { toast.success(r.message); load(); } else toast.error(r.message);
  };

  const handleCompSelect = (v: string | null) => {
    setCompId(v ?? "");
    const found = competitions.find((c) => c.id === v);
    if (found) setCompName(found.name);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
            <Trophy size={16} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ทำเนียบแชมป์</h1>
        </div>
        <p className="text-muted-foreground text-sm pl-11">บันทึกประวัติแชมป์ ∙ รองแชมป์ ∙ อันดับ 3 ของแต่ละรายการ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">ทั้งหมด</div>
          <div className="text-3xl font-bold text-white">{champions.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">รายการที่บันทึก</div>
          <div className="text-3xl font-bold text-emerald-400">{new Set(champions.map((c) => c.competitionName)).size}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2"><Plus size={16} /> เพิ่มแชมป์</Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รายการ</TableHead>
              <TableHead>ฤดูกาล</TableHead>
              <TableHead className="text-center">ปี</TableHead>
              <TableHead>🏆 แชมป์</TableHead>
              <TableHead>🥈 รองแชมป์</TableHead>
              <TableHead>🥉 อันดับ 3</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>{[...Array(7)].map((__, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
              ))
            ) : champions.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-16 text-muted-foreground text-sm">ยังไม่มีข้อมูลทำเนียบแชมป์</TableCell></TableRow>
            ) : (
              champions.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.competitionName}</TableCell>
                  <TableCell className="text-muted-foreground">{c.season || "-"}</TableCell>
                  <TableCell className="text-center font-bold">{c.year}</TableCell>
                  <TableCell><span className="font-semibold text-yellow-400">{c.champion}</span></TableCell>
                  <TableCell className="text-muted-foreground">{c.runnerUp || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.thirdPlace || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(c)}><Pencil size={12} /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-300" onClick={() => handleDelete(c.id)}><Trash2 size={12} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingId ? "แก้ไขทำเนียบแชมป์" : "เพิ่มทำเนียบแชมป์"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>รายการแข่งขัน</Label>
              <Select value={compId} onValueChange={handleCompSelect}>
                <SelectTrigger><SelectValue placeholder="เลือกรายการ..." /></SelectTrigger>
                <SelectContent>{competitions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>ชื่อรายการ (แก้ได้)</Label>
              <Input value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="เช่น AM Cup" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>ฤดูกาล</Label>
                <Input value={season} onChange={(e) => setSeason(e.target.value)} placeholder="เช่น Season 1" />
              </div>
              <div className="space-y-1.5">
                <Label>ปี</Label>
                <Input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10) || 0)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>🏆 แชมป์</Label>
              <Input value={champion} onChange={(e) => setChampion(e.target.value)} placeholder="ชื่อทีมแชมป์" />
            </div>
            <div className="space-y-1.5">
              <Label>🥈 รองแชมป์</Label>
              <Input value={runnerUp} onChange={(e) => setRunnerUp(e.target.value)} placeholder="ชื่อทีมรองแชมป์" />
            </div>
            <div className="space-y-1.5">
              <Label>🥉 อันดับ 3</Label>
              <Input value={thirdPlace} onChange={(e) => setThirdPlace(e.target.value)} placeholder="ชื่อทีมอันดับ 3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {editingId ? "บันทึก" : "เพิ่ม"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
