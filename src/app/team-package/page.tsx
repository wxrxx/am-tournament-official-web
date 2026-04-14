import Link from "next/link";

export const metadata = { title: "แพ็คทีม | AM Tournament" };

const packages = [
  {
    id: "pkg_001",
    name: "Starter",
    price: 3000,
    unit: "บาท / นัด",
    description: "เก็บรูปบรรยากาศทีมเบื้องต้น เหมาะสำหรับทีมที่เพิ่งเริ่มต้น",
    features: [
      "ภาพนิ่งขั้นต่ำ 50 รูป/นัด",
      "ภาพแอคชั่นรายบุคคล 70% ของทีม",
      "ลิงก์ Google Drive ส่งใน 48 ชม.",
    ],
    popular: false,
  },
  {
    id: "pkg_002",
    name: "Professional",
    price: 4500,
    unit: "บาท / นัด",
    description: "เก็บครบทุกแอคชั่นและอารมณ์ ยอดนิยมที่สุดของลีก",
    features: [
      "ภาพนิ่งไม่ต่ำกว่า 150 รูป/นัด",
      "ตากล้องประกบทีมแบบเจาะจง",
      "ช็อตทำประตูและดีใจครบ 100%",
      "ส่งไฟล์ด่วนภายใน 24 ชม.",
    ],
    popular: true,
  },
  {
    id: "pkg_003",
    name: "Ultimate",
    price: 8000,
    unit: "บาท / นัด",
    description: "เหมาจบทั้งภาพนิ่งและวิดีโอ 4K ระดับโปรเฟสชันนัล",
    features: [
      "ภาพนิ่งไม่จำกัดจำนวนช็อต",
      "คลิปไฮไลต์ทีม 1–3 นาที ความละเอียด 4K",
      "คลิปแนวตั้งสำหรับ Reels / TikTok",
      "สัมภาษณ์กัปตัน/โค้ชหลังเกม",
    ],
    popular: false,
  },
];

export default function TeamPackagePage() {
  return (
    <div className="pt-16">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-3">แพ็คจองช่างภาพ</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          จ้างช่างภาพกีฬามืออาชีพ บันทึกการเดินทางของทีมคุณตลอดทั้งฤดูกาล
        </p>
      </div>

      {/* Packages */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`flex flex-col p-8 rounded-sm border transition-colors ${
                pkg.popular
                  ? "border-primary bg-card"
                  : "border-border/50 bg-background"
              }`}
            >
              {pkg.popular && (
                <p className="text-[11px] font-semibold text-primary uppercase tracking-widest mb-5">
                  ยอดนิยม
                </p>
              )}
              <h3 className="text-xl font-semibold text-foreground mb-2">{pkg.name}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">{pkg.description}</p>

              <div className="mb-8 pb-6 border-b border-border/50">
                <span className="text-3xl font-bold text-foreground">{pkg.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground ml-1.5">{pkg.unit}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-foreground">
                    <span className="text-primary mt-0.5 shrink-0">—</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={`/shop/checkout?type=package&id=${pkg.id}&price=${pkg.price}&name=${encodeURIComponent(pkg.name)}`}
                className={`w-full py-3 text-sm font-semibold text-center rounded-sm transition-colors ${
                  pkg.popular
                    ? "bg-foreground text-background hover:opacity-85"
                    : "bg-muted text-foreground hover:bg-border/60"
                }`}
              >
                จองแพ็คนี้
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
