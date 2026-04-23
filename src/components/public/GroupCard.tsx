"use client";

import type { Club } from "@/types/club";
import { cn } from "@/lib/utils";

interface GroupCardProps {
  groupName: string;
  clubs: Club[];
  variant?: "default" | "overlay";
}

export default function GroupCard({ groupName, clubs, variant = "default" }: GroupCardProps) {
  const isOverlay = variant === "overlay";

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden",
        isOverlay
          ? "bg-black/70 backdrop-blur-md border border-white/10"
          : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm"
      )}
    >
      {/* Group Header */}
      <div
        className={cn(
          "px-5 py-3 flex items-center gap-3",
          isOverlay
            ? "bg-[#facc15]/20 border-b border-white/10"
            : "bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800"
        )}
      >
        <span
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg shrink-0",
            isOverlay
              ? "bg-[#facc15] text-black"
              : "bg-[#facc15]/10 text-[#facc15]"
          )}
        >
          {groupName}
        </span>
        <div>
          <p className={cn(
            "text-xs font-bold uppercase tracking-widest",
            isOverlay ? "text-[#facc15]" : "text-muted-foreground"
          )}>
            สาย {groupName}
          </p>
          <p className={cn(
            "text-[11px]",
            isOverlay ? "text-white/60" : "text-muted-foreground/70"
          )}>
            {clubs.length} ทีม
          </p>
        </div>
      </div>

      {/* Team List */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {clubs.length === 0 ? (
          <div className={cn(
            "px-5 py-8 text-center text-sm",
            isOverlay ? "text-white/40" : "text-muted-foreground"
          )}>
            ยังไม่มีทีมในสายนี้
          </div>
        ) : (
          clubs.map((club, i) => (
            <div
              key={club.id}
              className={cn(
                "flex items-center gap-3 px-5 py-3",
                isOverlay
                  ? "border-white/5"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              )}
              style={{
                animation: `fadeSlideIn 300ms ease-out ${i * 80}ms both`,
              }}
            >
              {/* Position */}
              <span className={cn(
                "w-6 text-center text-xs font-bold tabular-nums",
                isOverlay ? "text-white/40" : "text-muted-foreground"
              )}>
                {i + 1}
              </span>

              {/* Logo */}
              {club.logo ? (
                <img
                  src={club.logo}
                  alt={club.name}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                />
              ) : (
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  isOverlay
                    ? "bg-white/10 text-white/60"
                    : "bg-zinc-100 dark:bg-zinc-800 text-muted-foreground"
                )}>
                  {club.name.slice(0, 2)}
                </div>
              )}

              {/* Name */}
              <span className={cn(
                "text-sm font-medium truncate",
                isOverlay ? "text-white" : "text-zinc-800 dark:text-zinc-100"
              )}>
                {club.name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
