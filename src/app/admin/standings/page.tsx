"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getCompetitions, getGroupsForCompetition,
  getClubsByIds, getStandings, recalculateGroupStandings,
} from "@/app/actions/admin/matchActions";
import type { Standing } from "@/types/match";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BarChart3, RefreshCcw, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CompItem { id: string; name: string; status: string; }
interface GroupItem { id: string; name: string; teamIds: string[]; }
interface ClubItem { id: string; name: string; logo: string; }
type StandingWithId = Standing & { id: string };

export default function AdminStandingsPage() {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<CompItem[]>([]);
  const [selectedComp, setSelectedComp] = useState("");
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [standings, setStandings] = useState<StandingWithId[]>([]);
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    if (!user) return;
    getCompetitions(user.id).then((r) => { if (r.success) setCompetitions(r.competitions); });
  }, [user]);

  useEffect(() => {
    if (!user || !selectedComp) { setGroups([]); setSelectedGroup(""); return; }
    getGroupsForCompetition(user.id, selectedComp).then((r) => {
      if (r.success) { setGroups(r.groups); if (r.groups.length > 0) setSelectedGroup(r.groups[0].id); }
    });
  }, [user, selectedComp]);

  useEffect(() => {
    if (!user || groups.length === 0) { setClubs([]); return; }
    const allIds = [...new Set(groups.flatMap((g) => g.teamIds))];
    if (allIds.length === 0) return;
    getClubsByIds(user.id, allIds).then((r) => { if (r.success) setClubs(r.clubs); });
  }, [user, groups]);

  const loadStandings = useCallback(async () => {
    if (!user || !selectedComp || !selectedGroup) { setStandings([]); return; }
    setLoading(true);
    const r = await getStandings(user.id, selectedComp, selectedGroup);
    if (r.success) setStandings(r.standings);
    setLoading(false);
  }, [user, selectedComp, selectedGroup]);

  useEffect(() => { loadStandings(); }, [loadStandings]);

  const cName = (id: string) => clubs.find((c) => c.id === id)?.name ?? id;
  const cLogo = (id: string) => clubs.find((c) => c.id === id)?.logo ?? "";

  const handleRecalculate = async () => {
    if (!user || !selectedComp || !selectedGroup) return;
    const group = groups.find((g) => g.id === selectedGroup);
    if (!group || group.teamIds.length === 0) { toast.error("ไม่มีทีมในสายนี้"); return; }
    setRecalculating(true);
    const r = await recalculateGroupStandings(user.id, selectedComp, selectedGroup, group.teamIds);
    setRecalculating(false);
    if (r.success) { toast.success(r.message); loadStandings(); } else toast.error(r.message);
  };

  const activeGroupName = groups.find((g) => g.id === selectedGroup)?.name ?? "";

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
            <BarChart3 size={16} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ตารางคะแนน</h1>
        </div>
        <p className="text-muted-foreground text-sm pl-11">ดูตารางคะแนนแต่ละสาย และคำนวณใหม่ได้ตลอด</p>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5 w-64">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">รายการแข่งขัน</Label>
          <Select value={selectedComp} onValueChange={(v) => { setSelectedComp(v ?? ""); setSelectedGroup(""); }}>
            <SelectTrigger><SelectValue>{competitions.find((c) => c.id === selectedComp)?.name ?? "เลือกรายการ..."}</SelectValue></SelectTrigger>
            <SelectContent>{competitions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {selectedComp && groups.length > 0 && (
        <div className="flex gap-1 bg-muted/40 p-1 rounded-lg w-fit">
          {groups.map((g) => (
            <button key={g.id} type="button" onClick={() => setSelectedGroup(g.id)}
              className={cn("px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200",
                selectedGroup === g.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}>
              สาย {g.name}
            </button>
          ))}
        </div>
      )}

      {selectedComp && selectedGroup && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">ตารางคะแนน สาย {activeGroupName}</span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button size="sm" variant="outline" className="gap-2 text-xs" disabled={recalculating}>
                    {recalculating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />} Recalculate
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>คำนวณตารางคะแนนใหม่?</AlertDialogTitle>
                  <AlertDialogDescription>ระบบจะคำนวณคะแนนใหม่ทั้งหมดจากผลแมตช์จริงสำหรับสาย {activeGroupName}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRecalculate}>คำนวณใหม่</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>ทีม</TableHead>
                  <TableHead className="text-center w-12">เล่น</TableHead>
                  <TableHead className="text-center w-12">ชนะ</TableHead>
                  <TableHead className="text-center w-12">เสมอ</TableHead>
                  <TableHead className="text-center w-12">แพ้</TableHead>
                  <TableHead className="text-center w-12">ได้</TableHead>
                  <TableHead className="text-center w-12">เสีย</TableHead>
                  <TableHead className="text-center w-14">ต่าง</TableHead>
                  <TableHead className="text-center w-16 font-bold">คะแนน</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <TableRow key={i}>{[...Array(10)].map((__, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
                  ))
                ) : standings.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-16 text-muted-foreground text-sm">ยังไม่มีข้อมูลตารางคะแนนในสายนี้</TableCell></TableRow>
                ) : (
                  standings.map((row, idx) => {
                    const isQ = idx < 2;
                    const logo = cLogo(row.clubId);
                    return (
                      <TableRow key={row.id} className={cn(isQ && "bg-emerald-500/5")}>
                        <TableCell className="text-center">
                          <span className={cn("inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold", isQ ? "bg-emerald-500/20 text-emerald-400" : "text-muted-foreground")}>{idx + 1}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {logo ? <img src={logo} alt="" className="w-7 h-7 rounded-full object-cover border border-border shrink-0" /> : <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">{cName(row.clubId).slice(0, 2)}</div>}
                            <span className="font-semibold text-foreground">{cName(row.clubId)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">{row.played}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{row.won}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{row.drawn}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{row.lost}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{row.goalsFor}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{row.goalsAgainst}</TableCell>
                        <TableCell className="text-center">
                          <span className={cn("font-medium", row.goalDiff > 0 ? "text-emerald-400" : row.goalDiff < 0 ? "text-red-400" : "text-muted-foreground")}>{row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}</span>
                        </TableCell>
                        <TableCell className="text-center"><span className="text-base font-bold text-foreground">{row.points}</span></TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            {standings.length > 0 && (
              <div className="px-6 py-3 border-t border-border/50 flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-500/20" />
                <span className="text-[11px] text-muted-foreground">ผ่านเข้ารอบน็อกเอาต์</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
