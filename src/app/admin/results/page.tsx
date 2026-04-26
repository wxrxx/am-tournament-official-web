"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  updateMatchResult, resetMatchResult,
  getMatches, getGroupsForCompetition,
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
  Trophy, Pencil, RotateCcw,
  Check, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────
interface CompetitionItem { id: string; name: string; status: string; }
interface GroupItem { id: string; name: string; teamIds: string[]; }
interface ClubItem { id: string; name: string; logo: string; }

type MatchStatus = "scheduled" | "live" | "completed" | "postponed";

const STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: "กำหนดการ", live: "กำลังแข่ง",
  completed: "เสร็จแล้ว", postponed: "เลื่อน",
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

// ─── Component ──────────────────────────────────────────────────────
export default function AdminResultsPage() {
  const { user } = useAuth();

  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  // Result dialog
  const [resultMatch, setResultMatch] = useState<Match | null>(null);
  const [homeScore, setHomeScore] = useState("0");
  const [awayScore, setAwayScore] = useState("0");
  const [saving, setSaving] = useState(false);

  // Reset confirmation
  const [resetting, setResetting] = useState<string | null>(null);

  // ── Load competitions ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    getCompetitions(user.id).then((r) => {
      if (r.success) setCompetitions(r.competitions);
    });
  }, [user]);

  // ── Load groups when competition changes ──────────────────────────
  useEffect(() => {
    if (!user || !selectedComp) { setGroups([]); setSelectedGroup(""); return; }
    getGroupsForCompetition(user.id, selectedComp).then((r) => {
      if (r.success) setGroups(r.groups);
    });
  }, [user, selectedComp]);

  // ── Load clubs when groups change ─────────────────────────────────
  useEffect(() => {
    if (!user || groups.length === 0) { setClubs([]); return; }
    const allIds = [...new Set(groups.flatMap((g) => g.teamIds))];
    if (allIds.length === 0) return;
    getClubsByIds(user.id, allIds).then((r) => {
      if (r.success) setClubs(r.clubs);
    });
  }, [user, groups]);

  // ── Load matches ──────────────────────────────────────────────────
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

  // ── Filter: show only completed or let admin record results ───────
  const completedMatches = matches.filter((m) => m.status === "completed");
  const pendingMatches = matches.filter((m) => m.status !== "completed");

  // ── Save Result ───────────────────────────────────────────────────
  const handleSaveResult = async () => {
    if (!user || !resultMatch) return;
    const hs = parseInt(homeScore, 10);
    const as_ = parseInt(awayScore, 10);
    if (isNaN(hs) || isNaN(as_) || hs < 0 || as_ < 0) {
      toast.error("สกอร์ต้องเป็นจำนวนเต็มไม่ติดลบ");
      return;
    }
    setSaving(true);
    const r = await updateMatchResult(user.id, resultMatch.id, hs, as_);
    setSaving(false);
    if (r.success) {
      toast.success(r.message);
      setResultMatch(null);
      loadMatches();
    } else toast.error(r.message);
  };

  // ── Reset Result ──────────────────────────────────────────────────
  const handleReset = async (matchId: string) => {
    if (!user) return;
    if (!confirm("ต้องการรีเซ็ตผลแมตช์นี้? สกอร์จะกลับเป็น 0-0 และตารางคะแนนจะคำนวณใหม่")) return;
    setResetting(matchId);
    const r = await resetMatchResult(user.id, matchId);
    setResetting(null);
    if (r.success) {
      toast.success(r.message);
      loadMatches();
    } else toast.error(r.message);
  };

  // ── Derived stats ─────────────────────────────────────────────────
  const totalMatches = matches.length;
  const totalCompleted = completedMatches.length;
  const totalPending = pendingMatches.length;

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
            <Trophy size={16} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ผลการแข่งขัน</h1>
        </div>
        <p className="text-muted-foreground text-sm pl-11">
          บันทึกผล, แก้ไขสกอร์ และรีเซ็ตผลแมตช์ — ตารางคะแนนอัปเดตอัตโนมัติ
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5 w-64">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">รายการแข่งขัน</Label>
          <Select value={selectedComp} onValueChange={(v) => { setSelectedComp(v ?? ""); setSelectedGroup(""); }}>
            <SelectTrigger>
              <SelectValue>
                {competitions.find((c) => c.id === selectedComp)?.name ?? "เลือกรายการ..."}
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
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">กรองตามสาย</Label>
            <Select value={selectedGroup} onValueChange={(v) => setSelectedGroup(v ?? "")}>
              <SelectTrigger><SelectValue placeholder="ทุกสาย" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">ทุกสาย</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>สาย {g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      {selectedComp && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "แมตช์ทั้งหมด", value: totalMatches, color: "text-white" },
            { label: "บันทึกผลแล้ว", value: totalCompleted, color: "text-emerald-400" },
            { label: "ยังไม่บันทึก", value: totalPending, color: "text-zinc-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 space-y-1">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
              <div className={cn("text-3xl font-bold", s.color)}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Completed Matches Table ── */}
      {selectedComp && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            แมตช์ที่บันทึกผลแล้ว ({totalCompleted})
          </h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>สาย</TableHead>
                  <TableHead>คู่แข่ง</TableHead>
                  <TableHead className="text-center">สกอร์</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(6)].map((__, j) => (
                        <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : completedMatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                      ยังไม่มีแมตช์ที่บันทึกผลแล้ว
                    </TableCell>
                  </TableRow>
                ) : (
                  completedMatches.map((match) => {
                    const groupName = groups.find((g) => g.id === match.groupId)?.name ?? "-";
                    const homeLogo = clubLogo(match.homeTeamId);
                    const awayLogo = clubLogo(match.awayTeamId);
                    return (
                      <TableRow key={match.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(match.date as unknown as Timestamp)}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-bold text-yellow-400">สาย {groupName}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            {homeLogo && (
                              <img src={homeLogo} className="w-5 h-5 rounded-full object-cover" alt="" />
                            )}
                            <span>{clubName(match.homeTeamId)}</span>
                            <span className="text-muted-foreground">vs</span>
                            {awayLogo && (
                              <img src={awayLogo} className="w-5 h-5 rounded-full object-cover" alt="" />
                            )}
                            <span>{clubName(match.awayTeamId)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-lg">
                            {match.homeScore} – {match.awayScore}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", STATUS_CLASS[match.status])}>
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
                              <Pencil size={12} /> แก้ไขสกอร์
                            </Button>
                            <Button
                              size="sm" variant="ghost"
                              className="h-7 px-2 text-xs gap-1 text-red-400 hover:text-red-300"
                              onClick={() => handleReset(match.id)}
                              disabled={resetting === match.id}
                            >
                              {resetting === match.id
                                ? <Loader2 size={12} className="animate-spin" />
                                : <RotateCcw size={12} />
                              }
                              รีเซ็ต
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
        </div>
      )}

      {/* ── Pending Matches Table (record results) ── */}
      {selectedComp && pendingMatches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            แมตช์ที่ยังไม่บันทึกผล ({totalPending})
          </h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>สาย</TableHead>
                  <TableHead>คู่แข่ง</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">บันทึกผล</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingMatches.map((match) => {
                  const groupName = groups.find((g) => g.id === match.groupId)?.name ?? "-";
                  const homeLogo = clubLogo(match.homeTeamId);
                  const awayLogo = clubLogo(match.awayTeamId);
                  return (
                    <TableRow key={match.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(match.date as unknown as Timestamp)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-yellow-400">สาย {groupName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          {homeLogo && (
                            <img src={homeLogo} className="w-5 h-5 rounded-full object-cover" alt="" />
                          )}
                          <span>{clubName(match.homeTeamId)}</span>
                          <span className="text-muted-foreground">vs</span>
                          {awayLogo && (
                            <img src={awayLogo} className="w-5 h-5 rounded-full object-cover" alt="" />
                          )}
                          <span>{clubName(match.awayTeamId)}</span>
                        </div>
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
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 px-2 text-xs gap-1"
                          onClick={() => {
                            setResultMatch(match);
                            setHomeScore("0");
                            setAwayScore("0");
                          }}
                        >
                          <Pencil size={12} /> บันทึกผล
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ── Record / Edit Result Dialog ── */}
      <Dialog open={!!resultMatch} onOpenChange={(o) => { if (!o) setResultMatch(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {resultMatch?.status === "completed" ? "แก้ไขสกอร์" : "บันทึกผลการแข่ง"}
            </DialogTitle>
          </DialogHeader>
          {resultMatch && (
            <div className="space-y-6 py-2">
              <div className="flex items-center justify-center gap-6 text-sm font-bold">
                <div className="text-center flex-1">
                  {clubLogo(resultMatch.homeTeamId) && (
                    <img src={clubLogo(resultMatch.homeTeamId)} className="w-10 h-10 rounded-full mx-auto mb-1 object-cover" alt="" />
                  )}
                  <div className="leading-tight">{clubName(resultMatch.homeTeamId)}</div>
                </div>
                <span className="text-muted-foreground text-xs">VS</span>
                <div className="text-center flex-1">
                  {clubLogo(resultMatch.awayTeamId) && (
                    <img src={clubLogo(resultMatch.awayTeamId)} className="w-10 h-10 rounded-full mx-auto mb-1 object-cover" alt="" />
                  )}
                  <div className="leading-tight">{clubName(resultMatch.awayTeamId)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">สกอร์เหย้า</Label>
                  <Input
                    type="number" min={0}
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="text-center text-2xl font-bold h-14"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">สกอร์เยือน</Label>
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
            <Button variant="ghost" onClick={() => setResultMatch(null)}>ยกเลิก</Button>
            <Button onClick={handleSaveResult} disabled={saving} className="gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              บันทึกผล
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
