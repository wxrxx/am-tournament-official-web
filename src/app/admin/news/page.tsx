"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getNews,
  createNews,
  updateNews,
  deleteNews,
  publishNews,
} from "@/app/actions/admin/newsActions";
import type { News } from "@/types/news";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Skeleton } from "@/components/ui/skeleton";
import ImageUpload from "@/components/ui/ImageUpload";
import {
  Newspaper,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Eye,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminNewsPage() {
  const { user } = useAuth();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCat, setFilterCat] = useState<"all" | "news" | "highlight">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"news" | "highlight">("news");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNewsList = useCallback(async () => {
    setLoading(true);
    try {
      // Pass status/category if explicitly requested, but since we have client-side search too,
      // it's often easier to fetch all (or a large batch) and filter client-side for admin panels,
      // or pass exact filters. Let's pass exact filters if not 'all'.
      const fStatus = filterStatus === "all" ? undefined : filterStatus;
      const fCat = filterCat === "all" ? undefined : filterCat;

      const data = await getNews(fStatus, fCat, 100);
      setNewsList(data);
    } catch (error) {
      toast.error("ดึงข้อมูลข่าวสารไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCat]);

  useEffect(() => {
    fetchNewsList();
  }, [fetchNewsList]);

  // Derived stats
  const totalNews = newsList.length;
  const publishedNews = newsList.filter((n) => n.status === "published").length;
  const draftNews = newsList.filter((n) => n.status === "draft").length;

  const filteredNews = newsList.filter(
    (n) => n.title.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingId(null);
    setTitle("");
    setCategory("news");
    setCoverImage("");
    setContent("");
    setVideoUrl("");
    setIsPublished(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (news: News) => {
    setEditingId(news.id);
    setTitle(news.title);
    setCategory(news.category);
    setCoverImage(news.coverImage);
    setContent(news.content);
    setVideoUrl(news.videoUrl || "");
    setIsPublished(news.status === "published");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!title.trim() || !coverImage) {
      toast.error("กรุณากรอกหัวข้อและอัปโหลดภาพปก");
      return;
    }

    setSaving(true);
    const data = {
      title,
      category,
      coverImage,
      content,
      videoUrl: videoUrl || undefined,
      status: isPublished ? ("published" as const) : ("draft" as const),
      authorId: user.id,
      authorName: "Admin", // Or fetch user name
    };

    let res;
    if (editingId) {
      res = await updateNews(user.id, editingId, data);
    } else {
      res = await createNews(user.id, data);
    }

    setSaving(false);
    if (res.success) {
      toast.success(res.message);
      setIsDialogOpen(false);
      fetchNewsList();
    } else {
      toast.error(res.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setDeletingId(id);
    const res = await deleteNews(user.id, id);
    setDeletingId(null);
    if (res.success) {
      toast.success(res.message);
      fetchNewsList();
    } else {
      toast.error(res.message);
    }
  };

  const handlePublish = async (id: string) => {
    if (!user) return;
    const res = await publishNews(user.id, id);
    if (res.success) {
      toast.success(res.message);
      fetchNewsList();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#facc15]/20 rounded-md flex items-center justify-center">
              <Newspaper size={18} className="text-[#facc15]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">จัดการข่าวสาร & ไฮไลต์</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-11">
            สร้างและเผยแพร่คอนเทนต์ให้ผู้ติดตาม
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-[#facc15] hover:bg-[#eab308] text-black font-semibold gap-2">
          <Plus size={18} /> สร้างเนื้อหาใหม่
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/50 bg-card p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">ทั้งหมด</p>
            <h3 className="text-3xl font-bold">{totalNews}</h3>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-500">
            <Eye size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">เผยแพร่แล้ว</p>
            <h3 className="text-3xl font-bold">{publishedNews}</h3>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-6 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
            <Pencil size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">ฉบับร่าง (Draft)</p>
            <h3 className="text-3xl font-bold">{draftNews}</h3>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 items-center bg-muted/20">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="ค้นหาหัวข้อข่าว..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value as any)}
            >
              <option value="all">ทุกหมวดหมู่</option>
              <option value="news">ข่าวสาร</option>
              <option value="highlight">วิดีโอไฮไลต์</option>
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="published">เผยแพร่แล้ว</option>
              <option value="draft">ฉบับร่าง</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground">
            ไม่พบข้อมูลข่าวสารที่ค้นหา
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="border-b border-border text-muted-foreground text-[11px] uppercase tracking-wider text-left">
                  <th className="py-4 px-6 font-medium">ภาพปก</th>
                  <th className="py-4 px-6 font-medium">หัวข้อข่าว</th>
                  <th className="py-4 px-6 font-medium">หมวดหมู่</th>
                  <th className="py-4 px-6 font-medium">สถานะ</th>
                  <th className="py-4 px-6 font-medium">วันที่สร้าง</th>
                  <th className="py-4 px-6 font-medium text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredNews.map((n) => (
                  <tr key={n.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-6 w-[120px]">
                      <div className="w-20 h-12 bg-muted rounded-md overflow-hidden relative">
                        {n.coverImage ? (
                          <img src={n.coverImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">No img</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-6 font-medium max-w-[300px] truncate">
                      {n.title}
                    </td>
                    <td className="py-3 px-6">
                      <Badge variant="outline" className={n.category === "highlight" ? "border-purple-500 text-purple-500" : ""}>
                        {n.category === "highlight" ? "ไฮไลต์" : "ข่าวสาร"}
                      </Badge>
                    </td>
                    <td className="py-3 px-6">
                      {n.status === "published" ? (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-transparent">เผยแพร่แล้ว</Badge>
                      ) : (
                        <Badge variant="secondary">ฉบับร่าง</Badge>
                      )}
                    </td>
                    <td className="py-3 px-6 text-muted-foreground">
                      {new Date(n.publishedAt as string).toLocaleDateString("th-TH")}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {n.status === "draft" && (
                          <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => handlePublish(n.id)}>
                            <Eye size={14} /> เผยแพร่
                          </Button>
                        )}
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => openEditDialog(n)}>
                          <Pencil size={14} />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger render={
                            <Button size="icon" variant="destructive" className="h-8 w-8">
                              <Trash2 size={14} />
                            </Button>
                          } />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ยืนยันการลบข่าว?</AlertDialogTitle>
                              <AlertDialogDescription>
                                การลบ "{n.title}" จะทำให้ข้อมูลหายไปอย่างถาวร รวมถึงรูปภาพประกอบด้วย
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-destructive hover:bg-destructive/90 text-white"
                                onClick={() => handleDelete(n.id)}
                              >
                                {deletingId === n.id ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                                ยืนยันลบ
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Dialog ────────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border/40">
          <DialogHeader>
            <DialogTitle>{editingId ? "แก้ไขเนื้อหา" : "สร้างเนื้อหาใหม่"}</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label>หัวข้อข่าว <span className="text-red-500">*</span></Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="พิมพ์หัวข้อข่าวที่นี่..." />
              </div>
              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="news">ข่าวสาร</option>
                  <option value="highlight">ไฮไลต์วิดีโอ</option>
                </select>
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label>ภาพปก (Cover Image) <span className="text-red-500">*</span></Label>
              <div className="bg-muted/20 border border-border border-dashed rounded-lg p-2">
                <ImageUpload 
                  value={coverImage} 
                  onUpload={setCoverImage} 
                  folder="news" 
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label>เนื้อหา</Label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={content} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} 
                rows={6}
                placeholder="เขียนรายละเอียดเนื้อหาที่นี่..."
              />
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label>URL วิดีโอ (YouTube / Facebook) <span className="text-muted-foreground font-normal ml-2">(ไม่บังคับ)</span></Label>
              <Input 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20">
              <div>
                <Label className="text-base">สถานะเผยแพร่</Label>
                <p className="text-sm text-muted-foreground">เปิดเพื่อแสดงบนหน้าเว็บสาธารณะทันที</p>
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[120px]"
                value={isPublished ? "published" : "draft"}
                onChange={(e) => setIsPublished(e.target.value === "published")}
              >
                <option value="draft">ฉบับร่าง</option>
                <option value="published">เผยแพร่</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              ยกเลิก
            </Button>
            <Button 
              className="bg-[#facc15] hover:bg-[#eab308] text-black font-semibold" 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              บันทึกข้อมูล
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
