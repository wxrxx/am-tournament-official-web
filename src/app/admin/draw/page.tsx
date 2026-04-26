"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getCompetitionsForDraw,
  getOrCreateGroups,
  getApprovedTeamsForDraw,
  saveGroupDraw,
} from "@/app/actions/admin/drawActions";
import type { Group, CompetitionForDraw } from "@/types/tournament";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dices, Loader2, Copy, Check, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────
interface TeamItem {
  id: string;
  name: string;
  logo: string;
}

// ─── Component ──────────────────────────────────────────────────
export default function AdminDrawPage() {
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [competitions, setCompetitions] = useState<CompetitionForDraw[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionForDraw | null>(null);
  const [loading, setLoading] = useState(true);

  // Step 2
  const [groups, setGroups] = useState<Group[]>([]);
  const [allTeams, setAllTeams] = useState<TeamItem[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // slotKey → teamId
  const [saving, setSaving] = useState(false);

  // Popover state per slot
  const [openSlots, setOpenSlots] = useState<Record<string, boolean>>({});

  // OBS
  const [copied, setCopied] = useState(false);

  // ── Load competitions ─────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const res = await getCompetitionsForDraw(user.id);
      if (res.success) setCompetitions(res.competitions);
      setLoading(false);
    };
    load();
  }, [user]);

  // ── Select competition → load groups + teams ──────────────────
  const handleSelectCompetition = useCallback(async (comp: CompetitionForDraw) => {
    if (!user) return;
    setSelectedCompetition(comp);

    const groupRes = await getOrCreateGroups(user.id, comp.id, comp.numberOfGroups);
    if (!groupRes.success) {
      toast.error(groupRes.message);
      return;
    }
    const grps = groupRes.groups;
    setGroups(grps);

    // Rebuild assignments: { "groupId-index": teamId }
    const existing: Record<string, string> = {};
    grps.forEach((g) => {
      g.teamIds.forEach((teamId, index) => {
        existing[`${g.id}-${index}`] = teamId;
      });
    });
    setAssignments(existing);

    const teamRes = await getApprovedTeamsForDraw(user.id, comp.id);
    if (teamRes.success) setAllTeams(teamRes.teams);

    setStep(2);
  }, [user]);

  // ── Save draw ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user || !selectedCompetition) return;

    const teamsPerGroup = selectedCompetition.teamsPerGroup;
    const groupPayload = groups.map((g) => {
      const teamIds: string[] = [];
      for (let i = 0; i < teamsPerGroup; i++) {
        const slotKey = `${g.id}-${i}`;
        if (assignments[slotKey]) {
          teamIds.push(assignments[slotKey]);
        }
      }
      return { groupId: g.id, teamIds };
    });

    // Check if fully assigned
    const totalSlots = groups.length * teamsPerGroup;
    const assignedCount = Object.values(assignments).filter(Boolean).length;
    
    if (assignedCount < totalSlots && assignedCount < allTeams.length) {
      toast.error("กรุณาแบ่งสายทีมให้ครบก่อนบันทึก");
      return;
    }

    setSaving(true);
    const res = await saveGroupDraw(user.id, selectedCompetition.id, groupPayload);
    setSaving(false);

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  // ── OBS ───────────────────────────────────────────────────────
  const copyOBSLink = () => {
    const url = `${window.location.origin}/overlay/draw?competition=${selectedCompetition?.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("คัดลอก OBS Link สำเร็จ");
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Logic ─────────────────────────────────────────────────────
  const handleAssign = (slotKey: string, teamId: string) => {
    setAssignments(prev => ({ ...prev, [slotKey]: teamId }));
    setOpenSlots(prev => ({ ...prev, [slotKey]: false }));
  };

  const handleUnassign = (slotKey: string) => {
    setAssignments(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  };

  const assignedTeamIds = new Set(Object.values(assignments));
  const availableTeams = allTeams.filter(t => !assignedTeamIds.has(t.id));

  const teamsPerGroup = selectedCompetition?.teamsPerGroup ?? 4;
  const totalNeeded = (selectedCompetition?.numberOfGroups ?? 0) * teamsPerGroup;
  const totalAssigned = Object.keys(assignments).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
              <Dices size={16} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">แบ่งสาย (Group Draw)</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-11">
            {step === 1 ? "เลือกรายการแข่งขันที่ต้องการแบ่งสาย" : `รายการ: ${selectedCompetition?.name}`}
          </p>
        </div>

        {step === 2 && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStep(1);
                setSelectedCompetition(null);
                setGroups([]);
                setAllTeams([]);
                setAssignments({});
              }}
              className="gap-2 text-zinc-400 hover:text-foreground"
            >
              ← เลือกรายการอื่น
            </Button>
            <Button variant="outline" size="sm" onClick={copyOBSLink} className="gap-2">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์ OBS"}
            </Button>
          </div>
        )}
      </div>

      {/* ═══ Step 1 — เลือกรายการ ════════════════════════════════ */}
      {step === 1 && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-sm" />)}
            </div>
          ) : competitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-sm border border-border/40 bg-card">
              <Dices size={40} className="text-muted-foreground mb-4 opacity-50" />
              <p className="font-semibold text-foreground">ยังไม่มีรายการแข่งขัน</p>
              <p className="text-muted-foreground text-sm mt-1">สร้างรายการก่อนที่หน้าจัดการรายการ</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                เลือกรายการที่ต้องการแบ่งสาย
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {competitions.map((comp) => {
                  const hasGroupConfig = comp.numberOfGroups > 0 && comp.teamsPerGroup > 0;
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => hasGroupConfig && handleSelectCompetition(comp)}
                      disabled={!hasGroupConfig}
                      className={cn(
                        "text-left rounded-sm border p-4 space-y-2",
                        hasGroupConfig
                          ? "border-border/40 bg-card hover:border-primary/50 hover:bg-muted/10 cursor-pointer"
                          : "border-border/20 bg-muted/5 cursor-not-allowed opacity-60"
                      )}
                      style={{ transition: "border-color 200ms, background-color 200ms" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-foreground text-sm truncate">{comp.name}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 text-[10px] font-bold uppercase tracking-widest",
                            comp.status === "Open"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          )}
                        >
                          {comp.status === "Open" ? "เปิดรับ" : "ปิดรับ"}
                        </Badge>
                      </div>
                      {hasGroupConfig ? (
                        <p className="text-xs text-muted-foreground">
                          {comp.numberOfGroups} สาย · {comp.teamsPerGroup} ทีม/สาย · Quota {comp.teamQuota} ทีม
                        </p>
                      ) : (
                        <p className="text-xs text-primary/80">
                          ⚠ ยังไม่ได้ตั้งค่าสาย — แก้ไขได้ที่จัดการรายการ
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Step 2 — แบ่งสาย Dropdown ═══════════════════════════ */}
      {step === 2 && selectedCompetition && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest">
              จัดแล้ว {totalAssigned}/{totalNeeded} ทีม
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div key={group.id} className="rounded-sm border border-border/40 bg-card overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b border-border/40 flex justify-between items-center">
                  <h3 className="font-bold text-foreground">สาย {group.name}</h3>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    {Array.from({ length: teamsPerGroup }).filter((_, i) => assignments[`${group.id}-${i}`]).length}/{teamsPerGroup}
                  </Badge>
                </div>
                <div className="p-4 space-y-3">
                  {Array.from({ length: teamsPerGroup }).map((_, index) => {
                    const slotKey = `${group.id}-${index}`;
                    const assignedTeamId = assignments[slotKey];
                    const assignedTeam = allTeams.find(t => t.id === assignedTeamId);

                    return (
                      <div key={slotKey} className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                          {group.name}{index + 1}
                        </span>
                        
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <Popover open={openSlots[slotKey] || false} onOpenChange={(open) => setOpenSlots(p => ({ ...p, [slotKey]: open }))}>
                            <PopoverTrigger 
                              render={
                                <Button 
                                  variant="outline" 
                                  className={cn(
                                    "flex-1 justify-between px-3 h-10 border-border/40 hover:bg-muted/20 font-normal",
                                    !assignedTeam && "text-muted-foreground"
                                  )}
                                />
                              }
                            >
                              {assignedTeam ? (
                                <div className="flex items-center gap-2 truncate">
                                  {assignedTeam.logo ? (
                                    <img src={assignedTeam.logo} alt={assignedTeam.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold shrink-0">
                                      {assignedTeam.name.slice(0, 2)}
                                    </div>
                                  )}
                                  <span className="truncate">{assignedTeam.name}</span>
                                </div>
                              ) : (
                                "เลือกทีม..."
                              )}
                              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                            </PopoverTrigger>
                            <PopoverContent className="w-[280px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="ค้นหาชื่อทีม..." className="h-9" />
                                <CommandList>
                                  <CommandEmpty>ไม่พบทีมที่ค้นหา</CommandEmpty>
                                  <CommandGroup>
                                    {availableTeams.map(team => (
                                      <CommandItem
                                        key={team.id}
                                        value={team.name} // for search
                                        onSelect={() => handleAssign(slotKey, team.id)}
                                        className="gap-2"
                                      >
                                        {team.logo ? (
                                          <img src={team.logo} alt={team.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                                        ) : (
                                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                                            {team.name.slice(0, 2)}
                                          </div>
                                        )}
                                        <span className="truncate">{team.name}</span>
                                      </CommandItem>
                                    ))}
                                    {availableTeams.length === 0 && (
                                      <div className="py-2 text-center text-sm text-muted-foreground">ไม่มีทีมเหลือให้เลือก</div>
                                    )}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>

                          {assignedTeam && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleUnassign(slotKey)}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Available Teams Pool */}
          <div className="rounded-sm border border-border/40 bg-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
              ทีมที่รอแบ่งสาย ({availableTeams.length})
            </h3>
            {availableTeams.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">จัดทีมครบทุกสายแล้ว</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTeams.map(team => (
                  <Badge key={team.id} variant="secondary" className="px-3 py-1.5 font-normal text-xs gap-2 border border-border/40 bg-muted/20">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold">
                        {team.name.slice(0, 2)}
                      </div>
                    )}
                    {team.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-border/40">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 font-bold uppercase tracking-widest text-[11px]"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Dices size={16} />}
              บันทึกการแบ่งสาย
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
