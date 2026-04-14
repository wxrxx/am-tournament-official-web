import Link from "next/link";

export const metadata = { title: "ผลการแข่งขัน | AM Tournament" };

const recentResults = [
  { date: "อาทิตย์ 18 พ.ค. 2026", home: "Andaman Boys", away: "Southern Stars", scoreHome: 2, scoreAway: 1, isFinal: true },
  { date: "เสาร์ 17 พ.ค. 2026", home: "Lipe Marines", away: "FC Lipe", scoreHome: 0, scoreAway: 0, isFinal: true },
  { date: "เสาร์ 17 พ.ค. 2026", home: "North Kings", away: "Kanab FC", scoreHome: 3, scoreAway: 0, isFinal: true },
];

const teamStandings = [
  { rank: 1, team: "North Kings", p: 1, w: 1, d: 0, l: 0, gd: "+3", pts: 3 },
  { rank: 2, team: "Andaman Boys", p: 1, w: 1, d: 0, l: 0, gd: "+1", pts: 3 },
  { rank: 3, team: "Lipe Marines", p: 1, w: 0, d: 1, l: 0, gd: "0", pts: 1 },
  { rank: 4, team: "FC Lipe", p: 1, w: 0, d: 1, l: 0, gd: "0", pts: 1 },
  { rank: 5, team: "Southern Stars", p: 1, w: 0, d: 0, l: 1, gd: "-1", pts: 0 },
  { rank: 6, team: "Kanab FC", p: 1, w: 0, d: 0, l: 1, gd: "-3", pts: 0 },
];

export default function ResultsPage() {
  return (
    <div className="pt-16 min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          Match Results
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-4">ผลการแข่งขัน & ตารางคะแนน</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          สรุปผลการแข่งขันล่าสุดและตารางคะแนนสะสมของศึกลูกหนัง
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Results Column */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest border-b border-border/40 pb-4">
            ผลแข่งขันล่าสุด
          </h2>
          <div className="flex flex-col gap-4">
            {recentResults.map((res, i) => (
              <div key={i} className="bg-card p-5 border border-border/40 rounded-sm">
                <p className="text-[10px] text-muted-foreground mb-4">{res.date}</p>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${res.scoreHome > res.scoreAway ? 'text-foreground' : 'text-muted-foreground'}`}>{res.home}</p>
                  </div>
                  <div className="flex items-center gap-4 font-bold text-lg text-foreground bg-background px-4 py-2 rounded-sm border border-border/40">
                    <span>{res.scoreHome}</span>
                    <span className="text-muted-foreground text-[10px] font-normal uppercase">FT</span>
                    <span>{res.scoreAway}</span>
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${res.scoreAway > res.scoreHome ? 'text-foreground' : 'text-muted-foreground'}`}>{res.away}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standings Column */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-widest border-b border-border/40 pb-4">
            ตารางคะแนน
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[10px] uppercase text-muted-foreground tracking-wider border-b border-border/40">
                <tr>
                  <th className="font-medium px-2 py-3">อันดับ</th>
                  <th className="font-medium px-2 py-3 w-full">ทีม</th>
                  <th className="font-medium px-2 py-3 text-center">P</th>
                  <th className="font-medium px-2 py-3 text-center">W</th>
                  <th className="font-medium px-2 py-3 text-center">GD</th>
                  <th className="font-bold px-2 py-3 text-center text-foreground">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {teamStandings.map((team, idx) => (
                  <tr key={idx} className="hover:bg-muted/10 transition-colors">
                    <td className="px-2 py-4">
                      <span className={`w-5 h-5 flex items-center justify-center rounded-sm text-[11px] font-medium ${idx < 3 ? 'bg-primary text-black' : 'text-muted-foreground'}`}>
                        {team.rank}
                      </span>
                    </td>
                    <td className="px-2 py-4 font-medium text-foreground">{team.team}</td>
                    <td className="px-2 py-4 text-center text-muted-foreground">{team.p}</td>
                    <td className="px-2 py-4 text-center text-muted-foreground">{team.w}</td>
                    <td className="px-2 py-4 text-center text-muted-foreground">{team.gd}</td>
                    <td className="px-2 py-4 text-center font-bold text-foreground">{team.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
