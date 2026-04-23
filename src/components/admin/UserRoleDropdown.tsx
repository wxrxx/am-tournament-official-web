"use client";

import { useState } from "react";
import { ChevronDown, Shield, User, Loader2 } from "lucide-react";
import { changeUserRole } from "@/app/actions/admin/userActions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/user";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface UserRoleDropdownProps {
  uid: string;
  currentRole: UserRole;
  currentAdminUid: string;
  onRoleChanged: (uid: string, newRole: UserRole) => void;
}

export default function UserRoleDropdown({
  uid,
  currentRole,
  currentAdminUid,
  onRoleChanged,
}: UserRoleDropdownProps) {
  const [loading, setLoading] = useState(false);
  const isSelf = uid === currentAdminUid;

  const handleChange = async (newRole: UserRole) => {
    if (newRole === currentRole || isSelf) return;

    setLoading(true);
    const result = await changeUserRole(currentAdminUid, uid, newRole);
    if (result.success) {
      toast.success(result.message);
      onRoleChanged(uid, newRole);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  if (isSelf) {
    return (
      <Badge
        variant="outline"
        className="font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 border-primary/30 text-primary cursor-not-allowed opacity-70"
      >
        <Shield size={10} className="mr-1" />
        {currentRole}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={loading}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
          "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring",
          currentRole === "admin"
            ? "border-primary/30 text-primary"
            : "border-border/40 text-muted-foreground"
        )}
      >
        {loading ? (
          <Loader2 size={10} className="animate-spin" />
        ) : currentRole === "admin" ? (
          <Shield size={10} />
        ) : (
          <User size={10} />
        )}
        {currentRole}
        <ChevronDown size={10} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>เปลี่ยน Role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleChange("admin")}
            className={cn(currentRole === "admin" && "opacity-50")}
          >
            <Shield size={14} className="text-primary" />
            Admin
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleChange("user")}
            className={cn(currentRole === "user" && "opacity-50")}
          >
            <User size={14} />
            User
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
