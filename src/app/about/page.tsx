import Link from "next/link";
import { Shield, Sparkles, Trophy, Camera } from "lucide-react";

export const metadata = { title: "เกี่ยวกับเรา | AM Tournament" };

export default function AboutPage() {
  return (
    <div className="pt-16 min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          Our Story
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-6">เกี่ยวกับ AM Tournament</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          เราคือกลุ่มคนรักฟุตบอลที่มุ่งมั่นสร้างพื้นที่การแข่งขันที่มีมาตรฐาน ยุติธรรม และสร้างแรงบันดาลใจให้กับเยาวชนและนักกีฬาทั้งในและนอกจังหวัดสตูล
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="aspect-video bg-muted rounded-sm mb-16 overflow-hidden relative">
          <img 
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200" 
            alt="About AM Tournament" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">วิสัยทัศน์ของเรา</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              เราต้องการเป็นผู้นำในการจัดการทัวร์นาเมนต์ฟุตบอลสมัครเล่นที่ยกระดับมาตรฐานทั้งในด้านการแข่งขัน เทคโนโลยี และการสื่อสาร เพื่อสร้างประสบการณ์ที่ดีที่สุดให้กับนักแข่งและกองเชียร์
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">พันธกิจ</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              สนับสนุนทีมรากหญ้าให้มีพื้นที่โชว์ผลงานคุณภาพสูง ทั้งในรูปแบบภาพถ่ายและวิดีโอ เพื่อสร้างโปรไฟล์ให้นักเตะและสโมสรในระยะยาว
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-y border-border/40">
          {[
            { icon: Trophy, label: "6+ ฤดูกาล", sub: "จัดต่อเนื่อง" },
            { icon: Shield, label: "48+ ทีม", sub: "เข้าร่วมแข่งขัน" },
            { icon: Camera, label: "10k+ รูป", sub: "ผลงานคุณภาพ" },
            { icon: Sparkles, label: "100k+", sub: "ผู้ติดตามทางเพจ" }
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <item.icon className="w-6 h-6 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-lg font-bold text-foreground mb-1">{item.label}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
