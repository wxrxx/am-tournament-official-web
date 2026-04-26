"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Sparkles, Trophy, Camera, Edit2, Loader2 } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { AboutSettings } from "@/app/actions/admin/settingsActions";

export default function AboutPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [about, setAbout] = useState<AboutSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "about"), (snap) => {
      if (snap.exists()) {
        setAbout(snap.data() as AboutSettings);
      } else {
        setAbout(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching about settings:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="pt-16 min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative">
        {isAdmin && (
          <Link
            href="/admin/settings"
            className="absolute top-20 right-6 inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            <Edit2 size={12} />
            Edit Settings
          </Link>
        )}
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-primary mb-4 opacity-80">
          Our Story
        </p>
        <h1 className="text-3xl font-semibold text-foreground mb-6">เกี่ยวกับเรา</h1>
        <div className="max-w-2xl mx-auto min-h-[40px]">
          {loading ? (
             <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {about?.shortDescription || "เราคือกลุ่มคนรักฟุตบอลที่มุ่งมั่นสร้างพื้นที่การแข่งขันที่มีมาตรฐาน ยุติธรรม และสร้างแรงบันดาลใจให้กับเยาวชนและนักกีฬาทั้งในและนอกจังหวัดสตูล"}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="aspect-video bg-muted rounded-sm mb-16 overflow-hidden relative">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-muted/50">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <img 
                src={about?.imageUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200"} 
                alt="About AM Tournament" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {about?.orgName || "AM Tournament"}
            </h2>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                about?.history || "เราต้องการเป็นผู้นำในการจัดการทัวร์นาเมนต์ฟุตบอลสมัครเล่นที่ยกระดับมาตรฐานทั้งในด้านการแข่งขัน เทคโนโลยี และการสื่อสาร เพื่อสร้างประสบการณ์ที่ดีที่สุดให้กับนักแข่งและกองเชียร์ สนับสนุนทีมรากหญ้าให้มีพื้นที่โชว์ผลงานคุณภาพสูง ทั้งในรูปแบบภาพถ่ายและวิดีโอ เพื่อสร้างโปรไฟล์ให้นักเตะและสโมสรในระยะยาว"
              )}
            </div>
          </div>
          <div>
             <h2 className="text-xl font-semibold text-foreground mb-4">จุดเด่นของเรา</h2>
             <ul className="space-y-4 text-sm text-muted-foreground">
               <li className="flex items-start gap-3">
                 <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                 <span>การจัดการแข่งขันที่โปร่งใส ยุติธรรม และมีมาตรฐานสูง</span>
               </li>
               <li className="flex items-start gap-3">
                 <Trophy className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                 <span>ทีมงานคุณภาพ พร้อมประสบการณ์การจัดการแข่งขันมากกว่า 6 ฤดูกาล</span>
               </li>
               <li className="flex items-start gap-3">
                 <Camera className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                 <span>ระบบสื่อและการถ่ายทอดที่ทันสมัย ทั้งภาพนิ่งและวิดีโอความละเอียดสูง</span>
               </li>
               <li className="flex items-start gap-3">
                 <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                 <span>ผลักดันและสร้างแรงบันดาลใจให้เยาวชนในพื้นที่ต่อยอดสู่ความเป็นเลิศ</span>
               </li>
             </ul>
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
