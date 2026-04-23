"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  value?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  folder?: string;
  className?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ImageUpload({
  onUpload,
  value,
  label = "คลิกเพื่อเลือกรูป หรือลากวางที่นี่",
  accept = "image/*",
  maxSizeMB = 5,
  folder,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("รองรับเฉพาะไฟล์ JPG, PNG, WEBP เท่านั้น");
        return;
      }

      // Validate size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`ขนาดไฟล์ต้องไม่เกิน ${maxSizeMB}MB`);
        return;
      }

      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
        );
        if (folder) {
          formData.append("folder", folder);
        }

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error?.message || "อัปโหลดไม่สำเร็จ"
          );
        }

        setPreview(data.secure_url);
        onUpload(data.secure_url);
        toast.success("อัปโหลดสำเร็จ");
      } catch (err) {
        console.error("ImageUpload error:", err);
        toast.error(
          err instanceof Error
            ? err.message
            : "อัปโหลดไม่สำเร็จ กรุณาลองใหม่"
        );
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [maxSizeMB, folder, onUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onUpload("");
  };

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "relative flex flex-col items-center justify-center w-full min-h-[160px] rounded-sm border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
          uploading && "pointer-events-none opacity-70",
          preview
            ? "border-primary/30 bg-primary/5"
            : isDragging
            ? "border-primary bg-primary/10"
            : "border-border/40 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        {/* Uploading state */}
        {uploading && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 size={28} className="animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              กำลังอัปโหลด...
            </span>
          </div>
        )}

        {/* Preview state */}
        {!uploading && preview && (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full min-h-[160px] max-h-[240px] object-cover"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <X size={14} className="text-white" />
            </button>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-3 py-2">
              <span className="text-[11px] font-medium text-white/90">
                คลิกเพื่อเปลี่ยนรูป
              </span>
            </div>
          </>
        )}

        {/* Empty state */}
        {!uploading && !preview && (
          <div className="flex flex-col items-center gap-3 px-6 py-6">
            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
              <ImageIcon size={20} className="text-muted-foreground" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-foreground/80">
                {label}
              </p>
              <p className="text-[11px] text-muted-foreground">
                รองรับ JPG, PNG, WEBP ขนาดไม่เกิน {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
