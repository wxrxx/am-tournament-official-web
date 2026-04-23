"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteUser } from "@/app/actions/admin/userActions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
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

interface UserDeleteButtonProps {
  uid: string;
  displayName: string;
  currentAdminUid: string;
  onUserDeleted: (uid: string) => void;
}

export default function UserDeleteButton({
  uid,
  displayName,
  currentAdminUid,
  onUserDeleted,
}: UserDeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const isSelf = uid === currentAdminUid;

  const handleDelete = async () => {
    setLoading(true);
    const result = await deleteUser(currentAdminUid, uid);

    if (result.success) {
      toast.success(result.message);
      onUserDeleted(uid);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  if (isSelf) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={loading}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
        )}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ลบผู้ใช้ออกจากระบบ?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              คุณกำลังจะลบ &ldquo;{displayName}&rdquo; ออกจากระบบทั้งหมด
            </span>
            <span className="block text-red-500 font-medium">
              การลบไม่สามารถกู้คืนได้ ข้อมูลทั้งหมดของผู้ใช้นี้จะหายถาวร
              รวมถึงบัญชี Firebase Auth, ข้อมูลโปรไฟล์,
              ประวัติสั่งซื้อ และใบสมัครทีม
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            ลบผู้ใช้ถาวร
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
