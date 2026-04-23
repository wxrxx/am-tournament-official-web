"use client";

import { useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { editUser } from "@/app/actions/admin/userActions";
import { toast } from "sonner";
import type { EditUserPayload } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserEditDialogProps {
  uid: string;
  displayName: string;
  email: string;
  currentAdminUid: string;
  onUserEdited: (uid: string, data: EditUserPayload) => void;
}

export default function UserEditDialog({
  uid,
  displayName,
  email,
  currentAdminUid,
  onUserEdited,
}: UserEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formName, setFormName] = useState(displayName);
  const [formEmail, setFormEmail] = useState(email);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setFormName(displayName);
      setFormEmail(email);
    }
    setOpen(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      toast.error("ชื่อผู้ใช้ต้องไม่เป็นค่าว่าง");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      toast.error("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    setLoading(true);
    const payload: EditUserPayload = {
      displayName: formName.trim(),
      email: formEmail.trim(),
    };
    const result = await editUser(currentAdminUid, uid, payload);

    if (result.success) {
      toast.success(result.message);
      onUserEdited(uid, payload);
      setOpen(false);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center h-8 w-8 rounded-sm text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors"
      >
        <Pencil size={14} />
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-widest text-sm font-bold">
            แก้ไขข้อมูลผู้ใช้
          </DialogTitle>
          <DialogDescription>
            แก้ไขชื่อและอีเมลของ &ldquo;{displayName}&rdquo;
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">
              ชื่อผู้ใช้
            </Label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="กรอกชื่อผู้ใช้"
              className="rounded-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">
              อีเมล
            </Label>
            <Input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="example@email.com"
              className="rounded-sm"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-bold uppercase tracking-widest text-[11px]"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "บันทึกการเปลี่ยนแปลง"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
