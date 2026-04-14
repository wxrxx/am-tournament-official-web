"use client";

import { useEffect, useState } from "react";

export function useImageProtection() {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      alert("AM Tournament: ไม่อนุญาตให้บันทึกภาพ (Right-click disabled)");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block PrintScreen
      if (e.key === "PrintScreen") {
        setIsBlurred(true);
        navigator.clipboard.writeText("Screenshots are disabled.");
        alert("AM Tournament: ไม่อนุญาตให้แคปหน้าจอภาพลิขสิทธิ์");
        setTimeout(() => setIsBlurred(false), 3000);
      }
      
      // Block Ctrl+S, Ctrl+P
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "p")) {
        e.preventDefault();
        alert("Action disabled.");
      }
    };

    // Obfuscate when losing focus (e.g. Snipping tool opened)
    const handleBlur = () => {
      setIsBlurred(true);
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return { isBlurred };
}
