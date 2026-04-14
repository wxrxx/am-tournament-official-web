"use client";

import Swal from "sweetalert2";

export const swal = {
  success: (title: string, text?: string) => {
    return Swal.fire({
      icon: "success",
      title,
      text,
      background: "var(--card)",
      color: "var(--foreground)",
      confirmButtonColor: "var(--primary)",
      iconColor: "var(--primary)",
      customClass: {
        popup: "rounded-sm border border-border/40",
        confirmButton: "text-black text-xs font-bold px-8 py-2.5 uppercase tracking-widest",
      },
    });
  },
  error: (title: string, text?: string) => {
    return Swal.fire({
      icon: "error",
      title,
      text,
      background: "var(--card)",
      color: "var(--foreground)",
      confirmButtonColor: "var(--primary)",
      customClass: {
        popup: "rounded-sm border border-border/40",
        confirmButton: "text-black text-xs font-bold px-8 py-2.5 uppercase tracking-widest",
      },
    });
  },
  confirm: (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--primary)",
      cancelButtonColor: "var(--muted)",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      background: "var(--card)",
      color: "var(--foreground)",
      customClass: {
        popup: "rounded-sm border border-border/40",
        confirmButton: "text-black text-xs font-bold px-8 py-2.5 uppercase tracking-widest",
        cancelButton: "text-muted-foreground text-xs font-bold px-8 py-2.5 uppercase tracking-widest",
      },
    });
  },
  loading: (title: string) => {
    return Swal.fire({
      title,
      allowOutsideClick: false,
      background: "var(--card)",
      color: "var(--foreground)",
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: "rounded-sm border border-border/40",
      },
    });
  },
  close: () => {
    Swal.close();
  },
};
