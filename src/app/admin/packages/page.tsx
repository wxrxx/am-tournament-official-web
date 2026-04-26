"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getPackages, addPackage, updatePackage, deletePackage,
} from "@/app/actions/admin/packageActions";
import type { PackageData } from "@/app/actions/admin/packageActions";
import { Plus, Edit2, Zap, Target, Star, Loader2, CheckCircle2, Trash2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const iconMap: Record<string, React.ElementType> = {
  "Starter": Zap,
  "Professional": Target,
  "Ultimate": Star,
};

export default function AdminPackagesPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [popular, setPopular] = useState(false);
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPackages = async () => {
    if (!user) return;
    setIsLoading(true);
    const r = await getPackages(user.id);
    if (r.success) setPackages(r.packages);
    else toast.error(r.message);
    setIsLoading(false);
  };

  useEffect(() => { loadPackages(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusToggle = async (pkg: PackageData) => {
    if (!user) return;
    const newStatus = pkg.status === "Active" ? "Inactive" : "Active";
    const r = await updatePackage(user.id, pkg.id, { status: newStatus });
    if (r.success) {
      setPackages(packages.map(p => p.id === pkg.id ? { ...p, status: newStatus } : p));
      toast.success(`เปลี่ยนสถานะแพ็กเกจเป็น ${newStatus} สำเร็จ`);
    } else toast.error(r.message);
  };

  const handleDelete = async (pkg: PackageData) => {
    if (!user) return;
    const r = await deletePackage(user.id, pkg.id);
    if (r.success) {
      setPackages(packages.filter(p => p.id !== pkg.id));
      toast.success(r.message);
    } else toast.error(r.message);
  };

  const openAddDialog = () => {
    setEditingPackage(null);
    setName(""); setPrice(""); setUnit("บาท / นัด"); setDescription("");
    setFeatures(""); setPopular(false); setStatus("Active");
    setIsDialogOpen(true);
  };

  const openEditDialog = (pkg: PackageData) => {
    setEditingPackage(pkg);
    setName(pkg.name); setPrice(pkg.price.toString()); setUnit(pkg.unit || "บาท / นัด");
    setDescription(pkg.description || ""); setFeatures(pkg.features.join("\n"));
    setPopular(pkg.popular || false); setStatus(pkg.status);
    setIsDialogOpen(true);
  };

  const savePackage = async () => {
    if (!user || !name || !price || !features) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน"); return;
    }
    setIsSubmitting(true);
    const featureList = features.split("\n").map(f => f.trim()).filter(f => f.length > 0);
    const data: Omit<PackageData, "id"> = {
      name, price: Number(price), unit, description,
      features: featureList, popular, status,
    };

    const r = editingPackage
      ? await updatePackage(user.id, editingPackage.id, data)
      : await addPackage(user.id, data);

    if (r.success) {
      toast.success(r.message); setIsDialogOpen(false); loadPackages();
    } else toast.error(r.message);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">จัดการแพ็กเกจทีม</h1>
          <p className="text-muted-foreground">โครงสร้างราคาและฟีเจอร์สำหรับบริการถ่ายภาพทีมสโมสร</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={loadPackages} className="gap-2">
              <RefreshCcw size={14} className={isLoading ? "animate-spin" : ""} />
              Refresh
           </Button>
           <Button size="sm" onClick={openAddDialog} className="gap-2 font-bold uppercase tracking-widest text-[11px] rounded-sm">
             <Plus size={16} />
             Add Package
           </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-[400px] w-full rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.length > 0 ? packages.map((pkg) => {
            const Icon = iconMap[pkg.name] || Zap;
            return (
              <Card key={pkg.id} className={`relative flex flex-col border transition-all shadow-sm ${pkg.popular ? "border-primary/50 shadow-primary/10" : "border-border/40"}`}>
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger
                        className={`inline-flex items-center justify-center h-6 px-2 text-[10px] font-bold rounded-full border transition-all cursor-pointer ${
                          pkg.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border/40 hover:bg-muted/80"
                        }`}
                      >
                        {pkg.status}
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>เปลี่ยนสถานะแพ็กเกจ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            เปลี่ยนสถานะ &quot;{pkg.name}&quot; เป็น {pkg.status === "Active" ? "Inactive" : "Active"}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleStatusToggle(pkg)}>ยืนยัน</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>

                <CardHeader>
                   {pkg.popular && (
                     <Badge className="w-fit bg-primary text-black font-bold text-[10px] tracking-widest uppercase px-3 py-1 mb-2">
                       ยอดนิยม
                     </Badge>
                   )}
                   <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center mb-4">
                     <Icon size={24} className="text-primary" />
                   </div>
                   <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                   <CardDescription className="text-2xl font-black text-foreground mt-2">
                      ฿{pkg.price.toLocaleString()} <span className="text-sm text-muted-foreground font-medium">{pkg.unit}</span>
                   </CardDescription>
                   {pkg.description && (
                     <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">{pkg.description}</p>
                   )}
                </CardHeader>

                <CardContent className="flex-1">
                   <div className="space-y-4">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">Features Included</p>
                      <ul className="space-y-3">
                         {pkg.features.map((f, i) => (
                           <li key={i} className="text-sm font-medium flex items-start gap-2">
                              <CheckCircle2 size={14} className="text-primary mt-1 shrink-0" /> <span className="text-muted-foreground">{f}</span>
                           </li>
                         ))}
                      </ul>
                   </div>
                </CardContent>

                <Separator className="bg-border/40" />

                <CardFooter className="p-4 grid grid-cols-2 gap-2">
                   <Button variant="outline" size="sm" onClick={() => openEditDialog(pkg)} className="w-full gap-2 text-[10px] font-bold uppercase tracking-widest">
                      <Edit2 size={14} /> Edit
                   </Button>
                    <AlertDialog>
                      <AlertDialogTrigger className="inline-flex items-center justify-center h-8 px-3 text-[10px] font-bold rounded-sm uppercase tracking-widest border border-border/40 bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-muted-foreground transition-colors gap-1.5 w-full">
                        <Trash2 size={14} /> Delete
                      </AlertDialogTrigger>
                     <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ลบแพ็กเกจ?</AlertDialogTitle>
                          <AlertDialogDescription>การกระทำนี้ไม่สามารถย้อนกลับได้</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-white" onClick={() => handleDelete(pkg)}>ยืนยันการลบ</AlertDialogAction>
                        </AlertDialogFooter>
                     </AlertDialogContent>
                   </AlertDialog>
                </CardFooter>
              </Card>
            );
          }) : (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-border/40 rounded-sm">
               <p className="text-sm text-muted-foreground italic">ไม่มีข้อมูลแพ็กเกจในระบบ</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPackage ? "แก้ไขแพ็กเกจ" : "เพิ่มแพ็กเกจใหม่"}</DialogTitle>
            <DialogDescription>ปรับปรุงข้อมูลแพ็กเกจ ราคา และฟีเจอร์สำหรับการจองช่างภาพ</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-xs font-bold uppercase">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3 rounded-sm" placeholder="เช่น Starter, Professional" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right text-xs font-bold uppercase">Price</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3 rounded-sm" placeholder="เช่น 3000" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right text-xs font-bold uppercase">Unit</Label>
              <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="col-span-3 rounded-sm" placeholder="เช่น บาท / นัด" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right text-xs font-bold uppercase mt-2">Description</Label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 rounded-sm border border-border/40 bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[60px]"
                placeholder="คำอธิบายแพ็กเกจสั้นๆ" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="features" className="text-right text-xs font-bold uppercase mt-2">Features</Label>
              <div className="col-span-3">
                <textarea id="features" value={features} onChange={(e) => setFeatures(e.target.value)}
                  className="w-full rounded-sm border border-border/40 bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary min-h-[120px]"
                  placeholder={"ภาพนิ่งขั้นต่ำ 50 รูป/นัด\nภาพแอคชั่นรายบุคคล 70%\nลิงก์ Google Drive ส่งใน 48 ชม."} />
                <p className="text-[10px] text-muted-foreground mt-1 text-right">แยกแต่ละฟีเจอร์ด้วยการขึ้นบรรทัดใหม่ (Enter)</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mt-2">
              <Label className="text-right text-xs font-bold uppercase">Options</Label>
              <div className="col-span-3 flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={popular} onChange={(e) => setPopular(e.target.checked)} className="rounded border-border/40 bg-background" />
                  <span>ตั้งเป็นแพ็กเกจยอดนิยม</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4 mt-2">
              <Label className="text-right text-xs font-bold uppercase">Status</Label>
              <div className="col-span-3 flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={status === "Active"} onChange={() => setStatus("Active")} name="status" />
                  <span className="text-emerald-500 font-medium">Active</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={status === "Inactive"} onChange={() => setStatus("Inactive")} name="status" />
                  <span className="text-muted-foreground font-medium">Inactive</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting} className="rounded-sm text-xs font-bold uppercase tracking-widest">ยกเลิก</Button>
            <Button onClick={savePackage} disabled={isSubmitting} className="rounded-sm text-xs font-bold uppercase tracking-widest gap-2">
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {editingPackage ? "บันทึกการแก้ไข" : "เพิ่มแพ็กเกจ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
