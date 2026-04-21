"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Newspaper, Loader2, Calendar, Eye, EyeOff, Upload } from "lucide-react";
import { DataService, News } from "@/services/dataService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { CldUploadWidget, CldImage } from "next-cloudinary";

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

export default function AdminNewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<News | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    type: "News" as News["type"],
    status: "published" as News["status"],
    imageUrl: ""
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setIsLoading(true);
    const data = await DataService.getNews(true); // Include drafts
    setNews(data);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const success = await DataService.deleteNews(id);
    if (success) {
      setNews(news.filter(n => n.id !== id));
      toast.success("ลบข่าวสารเรียบร้อยแล้ว");
    } else {
      toast.error("เกิดข้อผิดพลาดในการลบ");
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      type: "News",
      status: "published",
      imageUrl: ""
    });
    setIsAdding(true);
  };

  const handleOpenEdit = (item: News) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      excerpt: item.excerpt || "",
      type: item.type,
      status: item.status,
      imageUrl: item.imageUrl
    });
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSaving(true);
    let success = false;
    if (editingItem) {
      success = await DataService.updateNews(editingItem.id, formData);
    } else {
      success = await DataService.createNews(formData);
    }

    if (success) {
      setIsAdding(false);
      loadNews();
      toast.success(editingItem ? "อัปเดตข่าวสารสำเร็จ" : "เพิ่มข่าวสารใหม่สำเร็จ");
    } else {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">จัดการข่าวสาร & ไฮไลต์</h1>
          <p className="text-muted-foreground">ประกาศข่าวสาร อัปเดตผลการแข่งขัน และแชร์ไฮไลต์สำคัญ</p>
        </div>

        <Button 
          size="sm" 
          onClick={handleOpenAdd}
          className="gap-2 font-bold uppercase tracking-widest text-[11px] rounded-sm"
        >
          <Plus size={16} />
          เพิ่มข่าวใหม่
        </Button>
      </div>

      <div className="rounded-sm border border-border/40 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[400px] uppercase tracking-widest text-[10px] font-bold">ข่าวสาร</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">ประเภท</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">สถานะ</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">วันที่ลงข่าว</TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <Loader2 className="animate-spin text-primary inline-block mb-3" size={24} />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">กำลังโหลดข่าวสาร...</p>
                </TableCell>
              </TableRow>
            ) : news.length > 0 ? (
              news.map((item) => (
                <TableRow key={item.id} className="group hover:bg-muted/10 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-10 rounded-sm bg-muted overflow-hidden shrink-0">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm line-clamp-1">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground line-clamp-1">{item.excerpt}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-bold text-[9px] uppercase tracking-wider px-2 py-0 border-primary/30 text-primary">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "font-bold text-[9px] uppercase tracking-wider px-2 py-0",
                        item.status === "published" ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                      )}
                    >
                      {item.status === "published" ? <Eye size={10} className="mr-1 inline" /> : <EyeOff size={10} className="mr-1 inline" />}
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(item.publishedAt).toLocaleDateString('th-TH')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenEdit(item)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
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
                            <AlertDialogTitle>ยืนยันการลบข่าวสาร?</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณแน่ใจหรือไม่ว่าต้องการลบข่าว "{item.title}" ข้อมูลนี้จะไม่สามารถกู้คืนได้
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)} variant="destructive">
                              ลบข่าวทันที
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
                  ไม่มีข่าวสารในระบบ
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-widest text-sm font-bold">
              {editingItem ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสารใหม่"}
            </DialogTitle>
            <DialogDescription>
              กรอกรายละเอียดข่าวสารหรือไฮไลต์เพื่อแสดงผลบนหน้าเว็บไซต์
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">หัวข้อข่าว</Label>
                  <Input
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="หัวข้อข่าวที่น่าสนใจ"
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">ประเภท</Label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="News">News</option>
                    <option value="Highlight">Highlight</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Gallery">Gallery</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">สถานะ</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={formData.status === "published"} 
                        onChange={() => setFormData({...formData, status: "published"})} 
                      />
                      <span className="text-sm">Published</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={formData.status === "draft"} 
                        onChange={() => setFormData({...formData, status: "draft"})} 
                      />
                      <span className="text-sm">Draft</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">รูปหน้าปก</Label>
                <CldUploadWidget
                  signatureEndpoint="/api/sign-cloudinary-params"
                  onSuccess={(result: any) => { setFormData({...formData, imageUrl: result.info.secure_url}); }}
                  options={{ maxFiles: 1, folder: "news" }}
                >
                  {({ open }) => (
                    <div
                      onClick={() => open()}
                      className="flex flex-col items-center justify-center w-full h-[180px] border-2 border-dashed border-border/30 rounded-sm cursor-pointer hover:border-primary/50 transition-colors bg-muted/10 overflow-hidden relative"
                    >
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 px-6">
                          <Upload size={24} className="text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground text-center">คลิกเพื่ออัปโหลดรูปภาพ</span>
                        </div>
                      )}
                    </div>
                  )}
                </CldUploadWidget>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">คำโปรย (Excerpt)</Label>
              <Input
                value={formData.excerpt}
                onChange={e => setFormData({...formData, excerpt: e.target.value})}
                placeholder="คำอธิบายสั้นๆ เกี่ยวกับข่าว"
                className="rounded-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">เนื้อหาข่าว</Label>
              <textarea
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="flex min-h-[120px] w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="รายละเอียดข่าวแบบเต็ม..."
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSaving} className="w-full font-bold uppercase tracking-widest text-[11px]">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : "บันทึกข่าวสาร"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
