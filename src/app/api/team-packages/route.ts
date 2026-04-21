import { NextResponse } from "next/server";

// API Route สำรองสำหรับ Team Packages (แก้ไขปัญหา 404)
// หน้าที่หลักคือดึงข้อมูลจากแพ็คเกจ (หรือใช้ DataService ทางฝั่ง Client เป็นหลัก)
export async function GET() {
  return NextResponse.json(
    { message: "Team packages route is active. Please use DataService client SDK for Firebase data." },
    { status: 200 }
  );
}

export async function POST(request: Request) {
  return NextResponse.json(
    { message: "Use DataService.createPackage() directly with Firebase client." },
    { status: 200 }
  );
}
