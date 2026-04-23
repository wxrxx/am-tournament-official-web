"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  createMatch, updateMatchResult, updateMatchStatus,
  deleteMatch, getMatches, getGroupsForCompetition,
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
  CalendarDays, Plus, Pencil, Trash2,
  Copy, Check, Loader2, Radio,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

export default function AdminSchedulePage() {
  const { user } = useAuth();

  const [competitions, setCompetitions] = useState<CompetitionItem[]>([]);
  const [selectedComp, setSelectedComp] = useState<string>("");
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createGroupId, setCreateGroupId] = useState("");
  const [createHome, setCreateHome] = useState("");
  const [createAway, setCreateAway] = useState("");
  const [createDate, setCreateDate] = useState("");
  const [createVenue, setCreateVenue] = useState("");
  const [creating, setCreating] = useState(false);

  // Result dialog
  const [resultMatch, setResultMatch] = useState<Match | null>(null);
  const [homeScore, setHomeScore] = useState("0");
  const [awayScore, setAwayScore] = useState("0");
  const [saving, setSaving] = useState(false);

  // Load competitions
  useEffect(() => {
    if (!user) return;
    getCompetitions(user.id).then((r) => {
      if (r.success) setCompetitions(r.competitions);
    });
  }, [user]);

  // Load groups when competition changes
  useEffect(() => {
    if (!user || !selectedComp) { setGroups([]); setSelectedGroup(""); return; }
    getGroupsForCompetition(user.id, selectedComp).then((r) => {
      if (r.success) setGroups(r.groups);
    });
  }, [user, selectedComp]);

  // Load clubs when groups change
  useEffect(() => {
    if (!user || groups.length === 0) { setClubs([]); return; }
    const allIds = [...new Set(groups.flatMap((g) => g.teamIds))];
    if (allIds.length === 0) return;
    getClubsByIds(user.id, allIds).then((r) => {
      if (r.success) setClubs(r.clubs);
    });
  }, [user, groups]);

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

  // Derived stats
  const totalMatches = matches.length;
  const completedMatches = matches.filter((m) => m.status === "completed").length;
  const scheduledMatches = matches.filter((m) => m.status === "scheduled").length;

  // ── Create Match ──────────────────────────────────────────────
  const handleCreate = async () => {
    if (!user) return;
    if (!createGroupId || !createHome || !createAway || !createDate || !createVenue.trim()) {
      toast.error("กรุณากรอกข้อมูลให้ครบ"); return;
    }
    if (createHome === createAway) {
      toast.error("ทีมเหย้าและทีมเยือนต้องเป็นคนละทีม"); return;
    }
    setCreating(true);
    const dateTs = Timestamp.fromDate(new Date(createDate));
    const r = await createMatch(user.id, {
      competitionId: selectedComp,
      groupId: createGroupId,
      homeTeamId: createHome,
      awayTeamId: createAway,
      homeScore: 0,
      awayScore: 0,
      date: dateTs as unknown as import("firebase/firestore").Timestamp,
      venue: createVenue.trim(),
      status: "scheduled",
      round: "group",
    });
    setCreating(false);
    if (r.success) {
      toast.success(r.message);
      setCreateOpen(false);
      setCreateGroupId(""); setCreateHome(""); setCreateAway("");
      setCreateDate(""); setCreateVenue("");
      loadMatches();
    } else toast.error(r.message);
  };

  // ── Save Result ───────────────────────────────────────────────
  const handleSaveResult = async () => {
    if (!user || !resultMatch) return;
    setSaving(true);
    const r = await updateMatchResult(
      user.id, resultMatch.id,
      parseInt(homeScore, 10), parseInt(awayScore, 10)
    );
    setSaving(false);
    if (r.success) {
      toast.success(r.message);
      setResultMatch(null);
      loadMatches();
    } else toast.error(r.message);
  };

  // ── Change Status ─────────────────────────────────────────────
  const handleStatus = async (matchId: string, status: MatchStatus) => {
    if (!user) return;
    const r = await updateMatchStatus(user.id, matchId, status);
    if (r.success) { toast.success(r.message); loadMatches(); }
    else toast.error(r.message);
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (matchId: string) => {
    if (!user) return;
    if (!confirm("ลบแมตช์นี้? หากแมตช์เสร็จแล้ว จะคำนวณคะแนนใหม่")) return;
    const r = await deleteMatch(user.id, matchId);
    if (r.success) { toast.success(r.message); loadMatches(); }
    else toast.error(r.message);
  };

  // ── Copy OBS ──────────────────────────────────────────────────
  const copyOBS = (key: string, url: string) => {
    const full = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(full);
    setCopiedKey(key);
    toast.success("คัดลอกลิงก์สำเร็จ");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Clubs available for the selected group in create dialog
  const groupClubs = groups
    .find((g) => g.id === createGroupId)
    ?.teamIds
    .map((id) => clubs.find((c) => c.id === id))
    .filter(Boolean) as ClubItem[] | undefined ?? [];

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
            <CalendarDays size={16} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">จัดการตารางแข่ง</h1>
        </div>
        <p className="text-muted-foreground text-sm pl-11">
          สร้างแมตช์, บันทึกผล และอัปเดตตารางคะแนนอัตโนมัติ
        </p>
      </div>

      {/* ── Competition Filter ── */}
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

        <Button
          onClick={() => setCreateOpen(true)}
          disabled={!selectedComp}
          className="gap-2 ml-auto"
        >
          <Plus size={16} /> สร้างแมตช์
        </Button>
      </div>

      {/* ── Stats ── */}
      {selectedComp && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "แมตช์ทั้งหมด", value: totalMatches, color: "text-white" },
            { label: "เสร็จแล้ว", value: completedMatches, color: "text-emerald-400" },
            { label: "ยังไม่แข่ง", value: scheduledMatches, color: "text-zinc-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className={cn("text-3xl font-bold", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Matches Table ── */}
      {selectedComp && (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>สาย</TableHead>
                <TableHead>สนาม</TableHead>
                <TableHead>คู่แข่ง</TableHead>
                <TableHead className="text-center">สกอร์</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : matches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    ยังไม่มีแมตช์ — กด "สร้างแมตช์" เพื่อเริ่มต้น
                  </TableCell>
                </TableRow>
              ) : (
                matches.map((match) => {
                  const groupName = groups.find((g) => g.id === match.groupId)?.name ?? "-";
                  return (
                    <TableRow key={match.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(match.date as unknown as Timestamp)}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-yellow-400">สาย {groupName}</span>
                      </TableCell>
                      <TableCell className="text-sm">{match.venue || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          {clubLogo(match.homeTeamId) && (
                            <img src={clubLogo(match.homeTeamId)} className="w-5 h-5 rounded-full object-cover" alt="" />
                          )}
                          <span>{clubName(match.homeTeamId)}</span>
                          <span className="text-muted-foreground">vs</span>
                          {clubLogo(match.awayTeamId) && (
                            <img src={clubLogo(match.awayTeamId)} className="w-5 h-5 rounded-full object-cover" alt="" />
                          )}
                          <span>{clubName(match.awayTeamId)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {match.status === "completed"
                          ? `${match.homeScore} – ${match.awayScore}`
                          : <span className="text-muted-foreground text-xs">-</span>
                        }
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
                            <Pencil size={12} /> บันทึกผล
                          </Button>
                          {match.status !== "live" ? (
                            <Button
                              size="sm" variant="ghost"
                              className="h-7 px-2 text-xs gap-1 text-yellow-400 hover:text-yellow-300"
                              onClick={() => handleStatus(match.id, "live")}
                            >
                              <Radio size={12} /> Live
                            </Button>
                          ) : (
                            <Button
                              size="sm" variant="ghost"
                              className="h-7 px-2 text-xs gap-1 text-muted-foreground"
                              onClick={() => handleStatus(match.id, "scheduled")}
                            >
                              หยุด Live
                            </Button>
                          )}
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 px-2 text-red-400 hover:text-red-300"
                            onClick={() => handleDelete(match.id)}
                          >
                            <Trash2 size={12} />
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
      )}

      {/* ── OBS Links ── */}
      {selectedComp && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            OBS Browser Source Links
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: "schedule", label: "ตารางแข่งวันนี้", path: `/overlay/schedule?competition=${selectedComp}` },
              { key: "standings", label: "ตารางคะแนน (สาย A)", path: `/overlay/standings?competition=${selectedComp}&group=A` },
              { key: "results", label: "ผล 5 แมตช์ล่าสุด", path: `/overlay/results?competition=${selectedComp}` },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => copyOBS(item.key, item.path)}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background hover:bg-muted/40 px-4 py-3 text-left"
                style={{ transition: "background-color 150ms" }}
              >
                <div>
                  <p className="text-xs font-semibold text-white">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{item.path.slice(0, 40)}</p>
                </div>
                {copiedKey === item.key
                  ? <Check size={14} className="text-emerald-400 shrink-0" />
                  : <Copy size={14} className="text-muted-foreground shrink-0" />
                }
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            💡 ใน OBS: <strong>Sources → Browser Source</strong> → วาง URL → ตั้ง Width: 1920, Height: 1080
          </p>
        </div>
      )}

      {/* ── Create Match Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>สร้างแมตช์ใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>สาย</Label>
              <Select value={createGroupId} onValueChange={(v) => { setCreateGroupId(v ?? ""); setCreateHome(""); setCreateAway(""); }}>
                <SelectTrigger><SelectValue placeholder="เลือกสาย..." /></SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>สาย {g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>ทีมเหย้า</Label>
                <Select value={createHome} onValueChange={(v) => setCreateHome(v ?? "")} disabled={!createGroupId}>
                  <SelectTrigger><SelectValue placeholder="เลือกทีม..." /></SelectTrigger>
                  <SelectContent>
                    {groupClubs.map((c) => (
                      <SelectItem key={c.id} value={c.id} disabled={c.id === createAway}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>ทีมเยือน</Label>
                <Select value={createAway} onValueChange={(v) => setCreateAway(v ?? "")} disabled={!createGroupId}>
                  <SelectTrigger><SelectValue placeholder="เลือกทีม..." /></SelectTrigger>
                  <SelectContent>
                    {groupClubs.map((c) => (
                      <SelectItem key={c.id} value={c.id} disabled={c.id === createHome}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>วันที่และเวลา</Label>
              <Input type="datetime-local" value={createDate} onChange={(e) => setCreateDate(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>สนาม</Label>
              <Input
                placeholder="ชื่อสนาม..."
                value={createVenue}
                onChange={(e) => setCreateVenue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleCreate} disabled={creating} className="gap-2">
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              สร้างแมตช์
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Record Result Dialog ── */}
      <Dialog open={!!resultMatch} onOpenChange={(o) => { if (!o) setResultMatch(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>บันทึกผลการแข่ง</DialogTitle>
          </DialogHeader>
          {resultMatch && (
            <div className="space-y-6 py-2">
              <div className="flex items-center justify-center gap-6 text-sm font-bold">
                <div className="text-center flex-1">
                  {clubLogo(resultMatch.homeTeamId) && (
                    <img src={clubLogo(resultMatch.homeTeamId)} className="w-10 h-10 rounded-full mx-auto mb-1 object-cover" alt="" />
                  )}
                  <p className="leading-tight">{clubName(resultMatch.homeTeamId)}</p>
                </div>
                <span className="text-muted-foreground text-xs">VS</span>
                <div className="text-center flex-1">
                  {clubLogo(resultMatch.awayTeamId) && (
                    <img src={clubLogo(resultMatch.awayTeamId)} className="w-10 h-10 rounded-full mx-auto mb-1 object-cover" alt="" />
                  )}
                  <p className="leading-tight">{clubName(resultMatch.awayTeamId)}</p>
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
