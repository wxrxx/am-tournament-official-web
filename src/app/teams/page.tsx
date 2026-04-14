import Link from "next/link";
import { Users, MapPin, Award } from "lucide-react";

export const metadata = { title: "รายชื่อทีม | AM Tournament" };

const teams = [
  { id: "tm_001", name: "Satun United", shortName: "SAT", region: "เมืองสตูล", since: 2024, points: 6, logoColor: "text-red-500", bgColor: "bg-red-500/10" },
  { id: "tm_002", name: "FC Lipe", shortName: "LIP", region: "หลีเป๊ะ", since: 2025, points: 4, logoColor: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "tm_003", name: "North Kings", shortName: "NOK", region: "ทุ่งหว้า", since: 2024, points: 9, logoColor: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  { id: "tm_004", name: "Andaman Boys", shortName: "AND", region: "ควนโดน", since: 2026, points: 3, logoColor: "text-cyan-500", bgColor: "bg-cyan-500/10" },
  { id: "tm_005", name: "Southern Stars", shortName: "SST", region: "มะนัง", since: 2025, points: 1, logoColor: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  { id: "tm_006", name: "Kanab FC", shortName: "KAN", region: "ท่าแพ", since: 2026, points: 0, logoColor: "text-purple-500", bgColor: "bg-purple-500/10" },
];

export default function TeamsPage() {
  return (
    <div className="pt-16 min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          Official Teams
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-4">สโมสรที่เข้าร่วมแข่งขัน</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          ทำความรู้จักทีมทั้ง 12 ทีมแห่ง ข้อมูลประวัติและสถิติสำคัญในการแข่งขันฤดูกาล 2026
        </p>
      </div>

      <div className="border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teams.map((team) => (
              <div key={team.id} className="group border border-border/50 bg-card rounded-sm p-8 hover:border-foreground/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-6 mb-8">
                  {/* Mock Logo */}
                  <div className={`w-16 h-16 rounded-sm flex items-center justify-center ${team.bgColor} border border-white/5`}>
                    <span className={`text-2xl font-bold font-heading ${team.logoColor}`}>
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
        </div>
      </div>
    </div>
  );
}
