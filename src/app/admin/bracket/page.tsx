"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCompetitions, getClubsByIds } from "@/app/actions/admin/matchActions";
import {
  generateBracket,
  getBracketMatches,
  updateBracketResult,
  updateBracketStatus,
} from "@/app/actions/admin/bracketActions";
import type { BracketMatch } from "@/types/bracket";
import type { Club } from "@/types/club";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Swords, Tv, Copy, Loader2, PlayCircle, StopCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminBracketPage() {
  const { user } = useAuth();

  const [competitions, setCompetitions] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompId, setSelectedCompId] = useState("");
  const [matches, setMatches] = useState<BracketMatch[]>([]);
  const [clubsMap, setClubsMap] = useState<Record<string, Club>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Score editing
  const [editingMatch, setEditingMatch] = useState<BracketMatch | null>(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [savingScore, setSavingScore] = useState(false);

  useEffect(() => {
    async function loadComps() {
      if (!user) return;
      const res = await getCompetitions(user.id);
      setCompetitions(res.competitions || []);
      if (res.competitions && res.competitions.length > 0) {
        setSelectedCompId(res.competitions[0].id);
      } else {
        setLoading(false);
      }
    }
    loadComps();
  }, [user]);

  const fetchBracketData = useCallback(async () => {
    if (!selectedCompId) return;
    setLoading(true);
    try {
      const data = await getBracketMatches(selectedCompId);
      setMatches(data);

      // Collect all unique team IDs to fetch clubs
      const teamIds = new Set<string>();
      data.forEach((m) => {
        if (m.homeTeamId) teamIds.add(m.homeTeamId);
        if (m.awayTeamId) teamIds.add(m.awayTeamId);
      });

      if (teamIds.size > 0 && user) {
        const res = await getClubsByIds(user.id, Array.from(teamIds));
        const map: Record<string, Club> = {};
        res.clubs?.forEach((c: any) => (map[c.id] = c));
        setClubsMap(map);
      }
    } catch (error) {
      toast.error("ดึงข้อมูล Bracket ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [selectedCompId]);

  useEffect(() => {
    fetchBracketData();
  }, [fetchBracketData]);

  const handleGenerate = async () => {
    if (!user || !selectedCompId) return;
    setGenerating(true);
    const res = await generateBracket(user.id, selectedCompId);
    setGenerating(false);
    if (res.success) {
      toast.success(res.message);
      fetchBracketData();
    } else {
      toast.error(res.message);
    }
  };

  const handleSaveScore = async () => {
    if (!user || !editingMatch) return;
    if (homeScore === awayScore) {
      toast.error("รอบน็อกเอาต์ต้องมีผู้ชนะ (ห้ามเสมอ)");
      return;
    }
    setSavingScore(true);
    const res = await updateBracketResult(user.id, editingMatch.id, homeScore, awayScore);
    setSavingScore(false);
    if (res.success) {
      toast.success(res.message);
      setEditingMatch(null);
      fetchBracketData();
    } else {
      toast.error(res.message);
    }
  };

  const toggleMatchStatus = async (match: BracketMatch) => {
    if (!user) return;
    const newStatus = match.status === "live" ? "completed" : "live";
    const res = await updateBracketStatus(user.id, match.id, newStatus);
    if (res.success) {
      toast.success(`เปลี่ยนสถานะเป็น ${newStatus.toUpperCase()}`);
      fetchBracketData();
    } else {
      toast.error(res.message);
    }
  };

  const getClub = (id: string) => clubsMap[id];

  // Group matches by round for visual rendering
  const rounds = useMemo(() => {
    const map = new Map<number, BracketMatch[]>();
    matches.forEach((m) => {
      const arr = map.get(m.round) || [];
      arr.push(m);
      map.set(m.round, arr);
    });
    // Sort rounds
    const sortedRounds = Array.from(map.keys()).sort((a, b) => a - b);
    return sortedRounds.map((r) => map.get(r)!);
  }, [matches]);

  const copyOverlayUrl = () => {
    const url = `${window.location.origin}/overlay/bracket?competition=${selectedCompId}`;
    navigator.clipboard.writeText(url);
    toast.success("คัดลอก OBS URL เรียบร้อย");
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#facc15]/20 rounded-md flex items-center justify-center">
              <Swords size={18} className="text-[#facc15]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">จัดการรอบน็อกเอาต์</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-11">
            สร้างสายการแข่งขันอัตโนมัติและบันทึกผล
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[200px]"
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
          >
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {selectedCompId && (
            <AlertDialog>
              <AlertDialogTrigger 
                render={
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
                    <RefreshCw size={15} /> สร้าง Bracket อัตโนมัติ
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการสร้างสายการแข่งขันใหม่?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ระบบจะดึงอันดับ 1-2 จากทุกกลุ่มมาจับคู่อัตโนมัติแบบไขว้ (Cross)
                    <br />
                    <span className="text-red-500 font-semibold mt-2 block">
                      คำเตือน: ข้อมูล Bracket ของรายการนี้ที่มีอยู่เดิม (ถ้ามี) จะถูกลบทิ้งถาวร
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={generating}>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-[#facc15] hover:bg-[#eab308] text-black font-semibold"
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    {generating ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                    ยืนยันสร้างใหม่
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* OBS Section */}
      <div className="rounded-xl border border-border/40 bg-card p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Tv size={20} className="text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">OBS Bracket Overlay</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browser Source 1920x1080 (โปร่งใสอัตโนมัติ)
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={copyOverlayUrl} className="gap-2 shrink-0">
          <Copy size={14} /> คัดลอก URL
        </Button>
      </div>

      {/* Bracket Board */}
      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-[80%]" />
            <Skeleton className="h-24 w-[60%]" />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Swords size={28} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">ยังไม่มีสายการแข่งขัน</p>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                กดปุ่ม "สร้าง Bracket อัตโนมัติ" ด้านบน เพื่อดึงทีมที่ผ่านเข้ารอบมาจัดสายอัตโนมัติ
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 overflow-x-auto custom-scrollbar">
            <div className="flex gap-12 min-w-max">
              {rounds.map((roundMatches, roundIndex) => (
                <div
                  key={roundIndex}
                  className="flex flex-col justify-around gap-6 w-[320px] relative"
                >
                  {/* Round Header */}
                  <div className="absolute -top-12 left-0 right-0 text-center font-bold text-muted-foreground uppercase tracking-widest text-sm">
                    {roundMatches[0].roundName === "F" ? (
                      <span className="text-[#facc15] flex items-center justify-center gap-2">
                        <Trophy size={16} /> FINAL
                      </span>
                    ) : (
                      roundMatches[0].roundName
                    )}
                  </div>

                  {roundMatches.map((match) => {
                    const home = getClub(match.homeTeamId);
                    const away = getClub(match.awayTeamId);
                    const isCompleted = match.status === "completed";
                    const hasResult = isCompleted && match.winnerId !== "";

                    const homeWon = hasResult && match.winnerId === match.homeTeamId;
                    const awayWon = hasResult && match.winnerId === match.awayTeamId;

                    return (
                      <div
                        key={match.id}
                        className="relative bg-background border border-border/50 rounded-lg shadow-sm hover:border-border transition-colors group"
                      >
                        {/* Live Badge */}
                        {match.status === "live" && (
                          <div className="absolute -top-2.5 -right-2.5 z-10">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                          </div>
                        )}

                        {/* Match Layout */}
                        <div className="flex flex-col">
                          {/* Home Team */}
                          <div
                            className={`flex items-center justify-between p-3 border-b border-border/30 ${
                              hasResult && !homeWon ? "opacity-50 grayscale" : ""
                            } ${homeWon ? "bg-[#facc15]/10" : ""}`}
                          >
                            <div className="flex items-center gap-2">
                              {home?.logo ? (
                                <img
                                  src={home.logo}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-muted rounded-full" />
                              )}
                              <span className={`text-sm font-semibold truncate max-w-[150px] ${homeWon ? "text-[#facc15]" : ""}`}>
                                {home?.name || "TBD"}
                              </span>
                            </div>
                            <span className={`font-bold ${homeWon ? "text-[#facc15]" : ""}`}>
                              {isCompleted || match.status === "live" ? match.homeScore : "-"}
                            </span>
                          </div>

                          {/* Away Team */}
                          <div
                            className={`flex items-center justify-between p-3 ${
                              hasResult && !awayWon ? "opacity-50 grayscale" : ""
                            } ${awayWon ? "bg-[#facc15]/10" : ""}`}
                          >
                            <div className="flex items-center gap-2">
                              {away?.logo ? (
                                <img
                                  src={away.logo}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-muted rounded-full" />
                              )}
                              <span className={`text-sm font-semibold truncate max-w-[150px] ${awayWon ? "text-[#facc15]" : ""}`}>
                                {away?.name || "TBD"}
                              </span>
                            </div>
                            <span className={`font-bold ${awayWon ? "text-[#facc15]" : ""}`}>
                              {isCompleted || match.status === "live" ? match.awayScore : "-"}
                            </span>
                          </div>
                        </div>

                        {/* Admin Actions Overlay (Shows on Hover) */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          {match.homeTeamId && match.awayTeamId && (
                            <>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="w-3/4 h-8 text-xs font-semibold"
                                onClick={() => {
                                  setEditingMatch(match);
                                  setHomeScore(match.homeScore);
                                  setAwayScore(match.awayScore);
                                }}
                              >
                                {isCompleted ? "แก้ไขผลสกอร์" : "บันทึกผล"}
                              </Button>

                              <Button
                                size="sm"
                                variant={match.status === "live" ? "destructive" : "default"}
                                className="w-3/4 h-8 text-xs gap-1"
                                onClick={() => toggleMatchStatus(match)}
                              >
                                {match.status === "live" ? (
                                  <>
                                    <StopCircle size={14} /> ปิด Live
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle size={14} /> ตั้ง Live
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                          {(!match.homeTeamId || !match.awayTeamId) && (
                            <span className="text-white/80 text-xs font-medium px-4 text-center">
                              รอผู้ชนะจากรอบที่แล้ว
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Champion Column */}
              <div className="flex flex-col justify-center items-center w-[200px] pl-8">
                {(() => {
                  const finalMatch = rounds[rounds.length - 1]?.[0];
                  if (finalMatch && finalMatch.status === "completed" && finalMatch.winnerId) {
                    const champ = getClub(finalMatch.winnerId);
                    return (
                      <div className="flex flex-col items-center animate-in zoom-in duration-500">
                        <Trophy size={64} className="text-[#facc15] mb-4 drop-shadow-lg" />
                        {champ?.logo && (
                          <img
                            src={champ.logo}
                            alt=""
                            className="w-20 h-20 rounded-full object-cover border-4 border-[#facc15] mb-3 shadow-xl"
                          />
                        )}
                        <span className="text-xl font-bold text-center text-[#facc15]">
                          {champ?.name}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground mt-1 tracking-widest uppercase">
                          Champion
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-col items-center opacity-20 grayscale">
                      <Trophy size={64} className="mb-4" />
                      <span className="font-bold">CHAMPION</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Score Dialog ────────────────────────────────────────────── */}
      <Dialog open={!!editingMatch} onOpenChange={() => setEditingMatch(null)}>
        <DialogContent className="max-w-md bg-card border-border/40">
          <DialogHeader>
            <DialogTitle>บันทึกผลการแข่งขัน (น็อกเอาต์)</DialogTitle>
          </DialogHeader>

          {editingMatch && (
            <div className="py-6 flex items-center justify-between gap-4">
              {/* Home */}
              <div className="flex flex-col items-center gap-3 w-[120px]">
                {getClub(editingMatch.homeTeamId)?.logo ? (
                  <img
                    src={getClub(editingMatch.homeTeamId).logo}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover border border-border/40"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted" />
                )}
                <span className="text-sm font-bold text-center truncate w-full">
                  {getClub(editingMatch.homeTeamId)?.name}
                </span>
                <Input
                  type="number"
                  min={0}
                  className="text-center text-2xl h-14 font-bold"
                  value={homeScore}
                  onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                />
              </div>

              <span className="text-2xl font-bold text-muted-foreground">-</span>

              {/* Away */}
              <div className="flex flex-col items-center gap-3 w-[120px]">
                {getClub(editingMatch.awayTeamId)?.logo ? (
                  <img
                    src={getClub(editingMatch.awayTeamId).logo}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover border border-border/40"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted" />
                )}
                <span className="text-sm font-bold text-center truncate w-full">
                  {getClub(editingMatch.awayTeamId)?.name}
                </span>
                <Input
                  type="number"
                  min={0}
                  className="text-center text-2xl h-14 font-bold"
                  value={awayScore}
                  onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMatch(null)} disabled={savingScore}>
              ยกเลิก
            </Button>
            <Button
              className="bg-[#facc15] hover:bg-[#eab308] text-black font-semibold"
              onClick={handleSaveScore}
              disabled={savingScore}
            >
              {savingScore ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              บันทึกและเลื่อนรอบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
