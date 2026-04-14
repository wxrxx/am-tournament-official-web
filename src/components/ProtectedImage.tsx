"use client";

import { useEffect, useRef } from "react";
import { useImageProtection } from "@/hooks/useImageProtection";

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
  price: number;
}

export default function ProtectedImage({ src, alt, className = "", price }: ProtectedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isBlurred } = useImageProtection();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous"; 

    // Apply Cloudinary transformations if it's a Cloudinary URL
    let finalSrc = src;
    if (src.includes("res.cloudinary.com")) {
      // Inject auto format, auto quality, and specific width for the canvas source
      const baseUrl = src.split("/upload/")[0] + "/upload/";
      const restUrl = src.split("/upload/")[1];
      finalSrc = `${baseUrl}f_auto,q_auto,w_1200/${restUrl}`;
    }
    
    img.src = finalSrc;

    img.onload = () => {
      // Set max size to 1200px equivalent ratio
      const MAX_WIDTH = 1200;
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height = (MAX_WIDTH * height) / width;
        width = MAX_WIDTH;
      }

      // Match canvas logical size to image scaled size
      canvas.width = width;
      canvas.height = height;

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Draw Watermark
      ctx.font = `bold ${Math.max(20, width * 0.04)}px sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Rotate for diagonal watermark
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-Math.PI / 6);
      
      // Draw multiple lines for watermark
      ctx.fillText("AM Tournament © 2026", 0, -30);
      ctx.fillText("- Preview Only -", 0, 10);
      ctx.fillStyle = "rgba(250, 204, 21, 0.6)"; // Yellowish text for price
      ctx.fillText(`Full HD ${price} บาท`, 0, 50);

      // Reset transforms
      ctx.rotate(Math.PI / 6);
      ctx.translate(-width / 2, -height / 2);
      
      // Tile watermark pattern faintly
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.font = "bold 14px sans-serif";
      for (let i = 0; i < width; i += 150) {
        for (let j = 0; j < height; j += 150) {
          ctx.fillText("AM", i, j);
        }
      }
    };
  }, [src, price]);

  return (
    <div className={`relative overflow-hidden group select-none pointer-events-auto ${className}`}>
      {/* Invisible overlay to catch right-clicks directly on the div if canvas somehow fails */}
      <div className="absolute inset-0 z-10 bg-transparent" onContextMenu={(e) => e.preventDefault()} />
      
      <canvas
        ref={canvasRef}
        title={alt}
        className={`w-full h-auto block object-cover transition-all duration-300 ${
          isBlurred ? "blur-xl grayscale" : "blur-none"
        }`}
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      />
      
      {isBlurred && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <p className="text-red-500 font-bold text-xl px-4 py-2 bg-black border border-red-500 rounded">
            Screenshot Blocked
          </p>
        </div>
      )}
    </div>
  );
}
