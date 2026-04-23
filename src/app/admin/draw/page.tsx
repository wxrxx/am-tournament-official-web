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
import { Dices, Loader2, Copy, Check, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// dnd-kit
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

// ─── Types ──────────────────────────────────────────────────────
interface TeamItem {
  id: string;
  name: string;
  logo: string;
}

// ─── Draggable Team Card ────────────────────────────────────────
function DraggableTeam({ team, overlay }: { team: TeamItem; overlay?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: team.id,
    data: { team },
  });

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      className={cn(
        "flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-lg p-3 select-none",
        overlay
          ? "shadow-2xl ring-2 ring-[#facc15]/50 scale-105"
          : isDragging
            ? "opacity-30"
            : "cursor-grab active:cursor-grabbing hover:border-zinc-500"
      )}
      style={{ transition: "border-color 150ms, opacity 150ms" }}
    >
      <GripVertical size={14} className="text-zinc-500 shrink-0" />
      {team.logo ? (
        <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full object-cover border border-zinc-600 shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0">
          {team.name.slice(0, 2)}
        </div>
      )}
      <span className="text-sm font-medium text-white flex-1">
        {team.name}
      </span>
    </div>
  );
}

// ─── Sortable Team Card (inside groups) ─────────────────────────
function SortableTeamCard({
  team,
  rank,
  groupName,
}: {
  team: TeamItem;
  rank: number;
  groupName: string;
}) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: team.id, data: { team } });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-4 bg-zinc-900 border border-zinc-700/60 rounded-xl px-4 py-3 cursor-grab active:cursor-grabbing select-none hover:border-zinc-500 hover:bg-zinc-800/80"
    >
      {/* อันดับ */}
      <span className="w-8 h-8 rounded-lg bg-[#facc15]/15 text-[#facc15] flex items-center justify-center text-xs font-bold shrink-0">
        {groupName}{rank}
      </span>

      {/* Logo */}
      {team.logo ? (
        <img
          src={team.logo}
          alt={team.name}
          className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
          {team.name.slice(0, 2)}
        </div>
      )}

      {/* ชื่อทีม */}
      <span className="text-sm font-semibold text-white flex-1">
        {team.name}
      </span>

      <GripVertical size={15} className="text-zinc-600 shrink-0" />
    </div>
  )
}

// ─── Droppable Group Zone ───────────────────────────────────────
function DroppableGroup({
  group,
  teams,
  teamsPerGroup,
}: {
  group: Group;
  teams: TeamItem[];
  teamsPerGroup: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `group-${group.id}`
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-4 min-h-[200px] space-y-3 rounded-b-xl border-2 border-dashed",
        isOver
          ? "border-[#facc15] bg-[#facc15]/5"
          : "border-transparent"
      )}
      style={{ transition: "border-color 200ms, background-color 200ms" }}
    >
      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center">
            <GripVertical size={20} className="text-zinc-700" />
          </div>
          <p className="text-zinc-600 text-sm">ลากทีมมาวางที่นี่</p>
        </div>
      ) : (
        <SortableContext
          items={teams.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {teams.map((team, index) => (
              <SortableTeamCard
                key={team.id}
                team={team}
                rank={index + 1}
                groupName={group.name}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  )
}

// ─── Unassigned Panel (Droppable) ───────────────────────────────
function UnassignedPanel({ teams }: { teams: TeamItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: "unassigned" });

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden self-start">
      <div className="px-4 py-3 bg-zinc-800/50 border-b border-zinc-700/50">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          ทีมรอแบ่งสาย ({teams.length})
        </p>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "p-3 space-y-2 max-h-[600px] overflow-y-auto min-h-[100px]",
          isOver && "bg-zinc-800/30"
        )}
        style={{ transition: "background-color 200ms" }}
      >
        {teams.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-zinc-600">
            จัดทีมครบทุกสายแล้ว ✓
          </div>
        ) : (
          teams.map((team) => <DraggableTeam key={team.id} team={team} />)
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────
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
  const [assignments, setAssignments] = useState<Record<string, string[]>>({}); // groupId → teamId[]
  const [saving, setSaving] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // DnD
  const [activeTeam, setActiveTeam] = useState<TeamItem | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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

    // Load or create groups
    const groupRes = await getOrCreateGroups(user.id, comp.id, comp.numberOfGroups);
    if (!groupRes.success) {
      toast.error(groupRes.message);
      return;
    }
    const grps = groupRes.groups;
    setGroups(grps);

    // Rebuild assignments from existing group data (groupId → teamId[])
    const existing: Record<string, string[]> = {};
    grps.forEach((g) => {
      existing[g.id] = g.teamIds;
    });
    setAssignments(existing);

    // Load approved teams
    const teamRes = await getApprovedTeamsForDraw(user.id, comp.id);
    if (teamRes.success) setAllTeams(teamRes.teams);

    setStep(2);
    setActiveGroupId(grps[0]?.id ?? null);
  }, [user]);

  // ── DnD handlers ─────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const team = event.active.data.current?.team as TeamItem | undefined;
    if (team) setActiveTeam(team);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTeam(null);
    const { active, over } = event;
    if (!over) return;

    const teamId = active.id as string;
    const overId = over.id as string;

    // Find which group currently contains this team
    const sourceGroupId = Object.entries(assignments).find(
      ([, teamIds]) => teamIds.includes(teamId)
    )?.[0] ?? null;

    // ── Dropped on a group zone ──
    if (overId.startsWith("group-")) {
      const targetGroupId = overId.replace("group-", "");
      const group = groups.find((g) => g.id === targetGroupId);
      if (!group) return;

      setAssignments((prev) => {
        const next: Record<string, string[]> = {};
        for (const key of Object.keys(prev)) {
          next[key] = [...prev[key]];
        }

        // Remove from source first
        if (sourceGroupId && next[sourceGroupId]) {
          next[sourceGroupId] = next[sourceGroupId].filter((id) => id !== teamId);
        }

        // Check capacity of target
        const targetTeams = next[targetGroupId] ?? [];
        const competition = selectedCompetition;
        const maxPerGroup = competition?.teamsPerGroup ?? teamsPerGroup;

        if (targetGroupId !== sourceGroupId && targetTeams.length >= maxPerGroup) {
          toast.error(`สาย ${group.name} เต็มแล้ว (${maxPerGroup} ทีม)`);
          return prev;
        }

        // Append to target (deduplicated)
        next[targetGroupId] = [...targetTeams, teamId]
          .filter((id, idx, arr) => arr.indexOf(id) === idx);
        return next;
      });
      return;
    }

    // ── Reorder within the same group (over.id is a teamId) ──
    if (sourceGroupId) {
      const currentOrder = assignments[sourceGroupId] ?? [];
      if (currentOrder.includes(overId)) {
        const oldIndex = currentOrder.indexOf(teamId);
        const newIndex = currentOrder.indexOf(overId);
        if (oldIndex !== newIndex) {
          setAssignments((prev) => ({
            ...prev,
            [sourceGroupId]: arrayMove(currentOrder, oldIndex, newIndex),
          }));
        }
        return;
      }
    }

    // ── Dropped on unassigned panel ──
    if (overId === "unassigned") {
      setAssignments((prev) => {
        const next: Record<string, string[]> = {};
        for (const key of Object.keys(prev)) {
          next[key] = [...prev[key]];
        }
        if (sourceGroupId && next[sourceGroupId]) {
          next[sourceGroupId] = next[sourceGroupId].filter((id) => id !== teamId);
        }
        return next;
      });
    }
  };

  // ── Save draw ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user || !selectedCompetition) return;

    const groupPayload = groups.map((g) => ({
      groupId: g.id,
      teamIds: assignments[g.id] ?? [],
    }));

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

  // ── Derived ───────────────────────────────────────────────────
  const teamsPerGroup = selectedCompetition?.teamsPerGroup ?? 4;
  const totalNeeded = (selectedCompetition?.numberOfGroups ?? 0) * teamsPerGroup;
  const totalAssigned = Object.values(assignments)
    .reduce((sum, teams) => sum + teams.length, 0);
  const assignedTeamIds = new Set(Object.values(assignments).flat());
  const unassignedTeams = allTeams.filter((t) => !assignedTeamIds.has(t.id));

  const getGroupTeams = (groupId: string): TeamItem[] =>
    (assignments[groupId] ?? [])
      .map((tid) => allTeams.find((t) => t.id === tid))
      .filter(Boolean) as TeamItem[];

  return (
    <div className="space-y-8">

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
              className="gap-2 text-zinc-400 hover:text-white"
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
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : competitions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-zinc-800 bg-zinc-900/50">
              <Dices size={40} className="text-zinc-700 mb-4" />
              <p className="font-semibold text-zinc-300">ยังไม่มีรายการแข่งขัน</p>
              <p className="text-zinc-500 text-sm mt-1">สร้างรายการก่อนที่หน้าจัดการรายการ</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
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
                        "text-left rounded-xl border p-4 space-y-2",
                        hasGroupConfig
                          ? "border-zinc-700 bg-zinc-900/50 hover:border-yellow-400/50 hover:bg-zinc-800/50 cursor-pointer"
                          : "border-zinc-800 bg-zinc-900/30 cursor-not-allowed opacity-60"
                      )}
                      style={{ transition: "border-color 200ms, background-color 200ms" }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-sm truncate">{comp.name}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 text-[10px] font-bold",
                            comp.status === "Open"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          )}
                        >
                          {comp.status === "Open" ? "เปิดรับ" : "ปิดรับ"}
                        </Badge>
                      </div>
                      {hasGroupConfig ? (
                        <p className="text-xs text-zinc-500">
                          {comp.numberOfGroups} สาย · {comp.teamsPerGroup} ทีม/สาย · Quota {comp.teamQuota} ทีม
                        </p>
                      ) : (
                        <p className="text-xs text-yellow-500/80">
                          ⚠ ยังไม่ได้ตั้งค่าสาย — แก้ไขได้ที่จัดการรายการ
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-sm text-zinc-500 text-center pt-2">
            ต้องการเพิ่มรายการใหม่?{" "}
            <a href="/admin/competitions" className="text-yellow-400 hover:underline">
              ไปหน้าจัดการรายการ →
            </a>
          </p>
        </div>
      )}

      {/* ═══ Step 2 — Drag & Drop ═════════════════════════════════ */}
      {step === 2 && selectedCompetition && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">

            {/* ── Info bar ── */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setSelectedCompetition(null)
                  setGroups([])
                  setAllTeams([])
                  setAssignments({})
                }}
                className="text-zinc-400 hover:text-white text-xs flex items-center gap-1"
                style={{ transition: "color 200ms" }}
              >
                ← เลือกรายการอื่น
              </button>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-bold">
                {selectedCompetition.name}
              </Badge>
              <Badge variant="outline" className={
                selectedCompetition.status === "Open"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  : "bg-red-500/10 text-red-500 border-red-500/30"
              }>
                {selectedCompetition.status === "Open" ? "เปิดรับสมัคร" : "ปิดรับสมัคร"}
              </Badge>
              <span className="text-muted-foreground ml-auto text-xs">
                จัดแล้ว {totalAssigned}/{totalNeeded} ทีม
              </span>
            </div>

            {/* ── Progress bar ── */}
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#facc15] rounded-full"
                style={{
                  width: `${totalNeeded > 0 ? (totalAssigned / totalNeeded) * 100 : 0}%`,
                  transition: "width 300ms ease-in-out",
                }}
              />
            </div>

            {/* ── Group Tabs ── */}
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => {
                const teamCount = (assignments[group.id] ?? []).length
                const isFull = teamCount >= teamsPerGroup
                const isActive = activeGroupId === group.id
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setActiveGroupId(group.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold",
                      "transition-all duration-200",
                      isActive
                        ? "bg-[#facc15] text-black border-[#facc15]"
                        : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                    )}
                  >
                    <span>สาย {group.name}</span>
                    <span className={cn(
                      "text-[11px] font-medium px-1.5 py-0.5 rounded-full",
                      isActive
                        ? "bg-black/20 text-black"
                        : isFull
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-zinc-700 text-zinc-400"
                    )}>
                      {teamCount}/{teamsPerGroup}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* ── Main Area: Selected Group + Unassigned ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

              {/* Left — Active Group Drop Zone */}
              {activeGroupId && (() => {
                const activeGroup = groups.find((g) => g.id === activeGroupId)
                if (!activeGroup) return null
                const groupTeams = getGroupTeams(activeGroupId)

                return (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
                    {/* Group Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-[#facc15]/20 text-[#facc15] flex items-center justify-center font-bold text-base">
                          {activeGroup.name}
                        </span>
                        <div>
                          <p className="font-bold text-white">สาย {activeGroup.name}</p>
                          <p className="text-xs text-zinc-500">
                            {groupTeams.length}/{teamsPerGroup} ทีม
                            {groupTeams.length >= teamsPerGroup && (
                              <span className="text-emerald-400 ml-2">✓ ครบแล้ว</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Drop Zone */}
                    <DroppableGroup
                      group={activeGroup}
                      teams={groupTeams}
                      teamsPerGroup={teamsPerGroup}
                    />
                  </div>
                )
              })()}

              {/* Right — Unassigned Panel */}
              <UnassignedPanel teams={unassignedTeams} />
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <p className="text-xs text-zinc-600">
                <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                  /overlay/draw?competition={selectedCompetition.id}
                </code>
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyOBSLink}
                  className="gap-2"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "คัดลอกแล้ว" : "OBS Link"}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || totalAssigned < totalNeeded}
                  className="gap-2"
                >
                  {saving
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Dices size={16} />
                  }
                  บันทึกการแบ่งสาย
                </Button>
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeTeam ? <DraggableTeam team={activeTeam} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
