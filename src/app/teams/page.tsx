"use client";

import { useEffect, useState } from "react";
import { Users, MapPin, Award } from "lucide-react";
import { DataService, Team } from "@/services/dataService";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getTeams().then((res) => {
      setTeams(res || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-background pb-32 animate-in fade-in duration-700">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-6">
        <div className="space-y-2">
          <Badge variant="outline" className="px-4 py-1 border-primary/40 text-primary font-bold tracking-[0.3em] uppercase text-[10px]">
            The Contenders
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">สโมสรที่เข้าร่วมแข่งขัน</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-base md:text-lg leading-relaxed">
          ทำความรู้จักสโมสรฟุตบอลชั้นนำที่เข้าร่วมประชันชัยใน AM Tournament ฤดูกาล 2026 ข้อมูลประวัติ สังกัด และสถิติที่น่าสนใจ
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <Separator className="bg-border/20 mb-16" />
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-sm" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="py-24 border-2 border-dashed border-border/40 rounded-sm text-center flex flex-col items-center justify-center space-y-4">
            <Users className="text-muted-foreground opacity-20" size={48} />
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">ยังไม่มีข้อมูลสโมสรในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team) => (
              <Card key={team.id} className="group border-border/40 hover:border-primary/40 transition-all duration-400 shadow-sm hover:shadow-lg hover:shadow-primary/5 bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-5">
                    {/* Real Team Logo */}
                    {team.logoUrl ? (
                      <img 
                        src={team.logoUrl} 
                        alt={team.name} 
                        className="w-16 h-16 rounded-xl object-cover border border-border/50 shadow-sm group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-muted/50 border border-border/40 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-500">
                        <Users size={24} className="text-muted-foreground/50" />
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300 line-clamp-1">
                        {team.name}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                        <MapPin size={12} className="text-primary/70" /> {team.region || 'ไม่ระบุโซน'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mt-1">
                        <Award size={12} className="text-primary/70" /> {team.competition || 'AM Tournament'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex flex-col flex-1 pb-4">
                   <div className="mt-auto grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
                      <div className="space-y-0.5 border-r border-border/50 px-1">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1">
                          ผู้จัดการทีม
                        </p>
                        <p className="text-[13px] font-bold text-foreground line-clamp-1">{team.managerName || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="space-y-0.5 px-2">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1">
                          Since
                        </p>
                        <p className="text-[13px] font-bold text-foreground">{team.since || new Date().getFullYear()}</p>
                      </div>
                   </div>
                </CardContent>

                <CardFooter className="bg-muted/10 py-3 flex justify-between items-center px-6 border-t border-border/20">
                   <Badge variant="outline" className="text-[9px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                      Official Team
                   </Badge>
                   <span className="text-[10px] text-muted-foreground font-semibold">AM VERIFIED</span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 flex justify-center opacity-40">
         <p className="text-[10px] uppercase tracking-[0.5em] font-bold">Quality // Excellence // Community</p>
      </div>
    </div>
  );
}
