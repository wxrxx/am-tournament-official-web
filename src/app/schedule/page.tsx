import { DataService, Match } from "@/services/dataService";

export const metadata = { title: "ตารางแข่งขัน | AM Tournament" };

export default async function SchedulePage() {
  const allMatches = await DataService.getMatches();
  const upcomingMatches = allMatches.filter(m => m.status === "upcoming");

  return (
    <div className="pt-16 min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          Match Fixtures
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-4">ตารางแข่งขัน</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          ติดตามโปรแกรมนัดแข่งขันของทุกทีมใน ฤดูกาล 2026 แบบเรียลไทม์
        </p>
      </div>

      {/* Schedule List */}
      <div className="border-y border-border/40 bg-card">
        <div className="max-w-5xl mx-auto px-6">
          {upcomingMatches.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-muted-foreground">ยังไม่มีกำหนดการแข่งขันในขณะนี้</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {upcomingMatches.map((match, idx) => (
                <div 
                  key={idx} 
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center py-8 gap-6 hover:bg-muted/10 transition-colors -mx-4 px-4 rounded-sm"
                >
                  {/* Home Team */}
                  <div className="flex md:justify-end items-center gap-4">
                    <p className="text-base font-medium text-foreground">{match.home || match.teamA}</p>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-muted-foreground font-bold">{(match.home || match.teamA || "?").charAt(0)}</span>
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="text-center px-4 flex flex-col items-center border-l md:border-l-0 border-border/40 pl-4 md:pl-0">
                    <p className="text-[11px] text-muted-foreground mb-1 tracking-wide">{match.date}</p>
                    <div className="bg-background border border-border px-4 py-1.5 rounded-sm mb-2 shadow-sm">
                      <p className="text-xl font-bold text-foreground tabular-nums tracking-wider">{match.time || "TBD"}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{match.venue || "TBD"}</p>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-4 border-l md:border-l-0 border-border/40 pl-4 md:pl-0">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-[10px] text-muted-foreground font-bold">{(match.away || match.teamB || "?").charAt(0)}</span>
                    </div>
                    <p className="text-base font-medium text-foreground">{match.away || match.teamB}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom spacing */}
      <div className="pb-32" />
    </div>
  );
}
