"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Tag, Layers, Loader2 } from "lucide-react";
import { DataService, Product } from "@/services/dataService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function AdminShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    stock: 0,
    category: "เสื้อผ้า"
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await DataService.getProducts();
    setProducts(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const success = await DataService.deleteProduct(id);
    if (success) {
      setProducts(products.filter(p => p.id !== id));
      toast.success("ลบสินค้าเรียบร้อยแล้ว");
    } else {
      toast.error("เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price <= 0) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSaving(true);
    const success = await DataService.createProduct(newProduct);
    if (success) {
      setIsAdding(false);
      setNewProduct({ name: "", price: 0, stock: 0, category: "เสื้อผ้า" });
      loadProducts();
      toast.success("เพิ่มสินค้าใหม่สำเร็จ");
    } else {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">จัดการร้านค้า</h1>
          <p className="text-muted-foreground">จัดการข้อมูลสินค้า สต็อก และหมวดหมู่สินค้าพรีเมียม</p>
        </div>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          {/* Use DialogTrigger with buttonVariants styling directly — no asChild */}
          <DialogTrigger
            className={cn(
              buttonVariants({ size: "sm" }),
              "gap-2 font-bold uppercase tracking-widest text-[11px] rounded-sm"
            )}
          >
            <Plus size={16} />
            เพิ่มสินค้าใหม่
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="uppercase tracking-widest text-sm font-bold">เพิ่มสินค้าใหม่</DialogTitle>
              <DialogDescription>
                กรอกรายละเอียดสินค้าที่คุณต้องการเพิ่มเข้าสู่ระบบร้านค้า
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">ชื่อสินค้า</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="เช่น Official Jersey 2026"
                  className="rounded-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">ราคา (บาท)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">สต็อก (ชิ้น)</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                    className="rounded-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">หมวดหมู่</Label>
                <select
                  id="category"
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="เสื้อผ้า">เสื้อผ้า</option>
                  <option value="ของที่ระลึก">ของที่ระลึก</option>
                  <option value="เครื่องประดับ">เครื่องประดับ</option>
                </select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSaving} className="w-full font-bold uppercase tracking-widest text-[11px]">
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : "บันทึกคลังสินค้า"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-sm border border-border/40 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[300px] uppercase tracking-widest text-[10px] font-bold">ชื่อสินค้า</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">หมวดหมู่</TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">ราคา</TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">สต็อก</TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <Loader2 className="animate-spin text-primary inline-block mb-3" size={24} />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">กำลังโหลดคลังสินค้า...</p>
                </TableCell>
              </TableRow>
            ) : products.length > 0 ? (
              products.map((p) => (
                <TableRow key={p.id} className="group hover:bg-muted/10 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center text-muted-foreground">
                        <Tag size={16} />
                      </div>
                      <span className="text-sm">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal text-[10px] gap-1 px-2 py-0">
                      <Layers size={10} /> {p.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm">฿{p.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={`text-[11px] font-bold ${p.stock <= 0 ? "text-red-500" : "text-emerald-500"}`}>
                      {p.stock <= 0 ? "OUT OF STOCK" : `${p.stock} Units`}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Edit2 size={14} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                          )}
                        >
                          <Trash2 size={14} />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการลบสินค้า?</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "{p.name}" ออกจากระบบ ข้อมูลนี้จะไม่สามารถกู้คืนได้
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(p.id)} variant="destructive">
                              ลบสินค้าทันที
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground text-xs italic">
                  ไม่มีสินค้าในระบบ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
