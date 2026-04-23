"use client";

import UserTable from "@/components/admin/UserTable";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            จัดการผู้ใช้
          </h1>
          <p className="text-muted-foreground">
            ดูรายชื่อ กำหนดสิทธิ์ แบน และจัดการข้อมูลผู้ใช้ทั้งหมดในระบบ
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-primary/10 text-primary border-primary/20 gap-1.5 py-1 px-3 font-bold text-[10px] uppercase tracking-wider"
        >
          <Users size={12} />
          User Management
        </Badge>
      </div>

      {/* User Table */}
      <UserTable />
    </div>
  );
}
