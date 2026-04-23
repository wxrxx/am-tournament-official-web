"use client";

import { useState } from "react";
import { ShieldOff, ShieldCheck, Loader2 } from "lucide-react";
import { banUser, unbanUser } from "@/app/actions/admin/userActions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserBanButtonProps {
  uid: string;
  displayName: string;
  banned: boolean;
  currentAdminUid: string;
  onStatusChanged: (uid: string, banned: boolean) => void;
}

export default function UserBanButton({
  uid,
  displayName,
  banned,
  currentAdminUid,
  onStatusChanged,
}: UserBanButtonProps) {
  const [loading, setLoading] = useState(false);
  const isSelf = uid === currentAdminUid;

  const handleToggleBan = async () => {
    setLoading(true);
    const action = banned ? unbanUser : banUser;
    const result = await action(currentAdminUid, uid);

    if (result.success) {
      toast.success(result.message);
      onStatusChanged(uid, !banned);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  if (isSelf) return null;

  // Unban: no confirmation needed
  if (banned) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={handleToggleBan}
        className="h-7 gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <ShieldCheck size={12} />
        )}
        ปลดแบน
      </Button>
    );
  }

  // Ban: requires confirmation
  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={loading}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-7 gap-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-500 hover:text-orange-500 hover:bg-orange-500/10"
        )}
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <ShieldOff size={12} />
        )}
        แบน
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการแบนผู้ใช้?</AlertDialogTitle>
          <AlertDialogDescription>
            คุณกำลังจะแบน &ldquo;{displayName}&rdquo;
            ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้ทันที
            คุณสามารถปลดแบนได้ในภายหลัง
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleToggleBan}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            แบนผู้ใช้ทันที
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
