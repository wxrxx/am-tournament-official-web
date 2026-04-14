"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, MapPin, Award } from "lucide-react";
import { DataService, Team } from "@/services/dataService";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getTeams().then((res) => {
      setTeams(res || []);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="pt-32 flex justify-center text-muted-foreground text-sm animate-pulse">
      กำลังดึงข้อมูลสโมสร...
    </div>
  );

  return (
    <div className="pt-16 min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          Official Teams
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-4">สโมสรที่เข้าร่วมแข่งขัน</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          ทำความรู้จักสโมสรที่เข้าร่วมการแข่งขัน ข้อมูลประวัติและสถิติสำคัญในการแข่งขันฤดูกาล 2026
        </p>
      </div>

      <div className="border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {teams.length === 0 ? (
            <div className="py-20 border border-dashed border-border/60 rounded-sm text-center">
              <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลสโมสรในขณะนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teams.map((team) => (
                <div key={team.id} className="group border border-border/50 bg-card rounded-sm p-8 hover:border-foreground/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-6 mb-8">
                    {/* Mock Logo (CSS Initials as requested) */}
                    <div className={`w-16 h-16 rounded-sm flex items-center justify-center ${team.bgColor || 'bg-muted'} border border-white/5`}>
                      <span className={`text-2xl font-bold font-heading ${team.logoColor || 'text-foreground'}`}>
                        {team.shortName}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase tracking-wider">
                        <MapPin size={10} /> {team.region}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Users size={10} /> ก่อตั้งปี
                      </p>
                      <p className="text-base font-medium text-foreground">{team.since}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Award size={10} /> คะแนนสะสม
                      </p>
                      <p className="text-base font-medium text-foreground">{team.points} <span className="text-[10px] text-muted-foreground font-normal">pts</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
