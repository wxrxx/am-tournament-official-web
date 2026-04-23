"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Loader2, ShoppingCart, Users as UsersIcon } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface UserHistoryDrawerProps {
  uid: string;
  displayName: string;
  email: string;
  children: React.ReactNode;
}

interface OrderRecord {
  id: string;
  name: string;
  price: number;
  status: string;
  createdAt: string;
}

interface RegistrationRecord {
  id: string;
  teamName: string;
  competitionId: string;
  managerName: string;
  status: string;
  submittedAt: string;
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "pending") return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  if (s === "paid" || s === "confirmed" || s === "approved")
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (s === "cancelled" || s === "rejected")
    return "bg-red-500/10 text-red-500 border-red-500/20";
  return "bg-muted text-muted-foreground";
}

function formatDate(val: string | Timestamp | undefined): string {
  if (!val) return "-";
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleDateString("th-TH");
  }
  return val.toDate().toLocaleDateString("th-TH");
}

export default function UserHistoryDrawer({
  uid,
  displayName,
  email,
  children,
}: UserHistoryDrawerProps) {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch orders (top-level collection, query by userId)
      try {
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", uid)
        );
        const ordersSnap = await getDocs(ordersQuery);
        const ordersData = ordersSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: (d.name as string) || "ไม่มีชื่อสินค้า",
            price: (d.price as number) || 0,
            status: (d.status as string) || "pending",
            createdAt: (d.createdAt as string) || "",
          };
        });
        setOrders(ordersData);
      } catch {
        setOrders([]);
      }

      // Fetch team registrations (top-level collection, query by email)
      try {
        const regsQuery = query(
          collection(db, "team_registrations"),
          where("email", "==", email)
        );
        const regsSnap = await getDocs(regsQuery);
        const regsData = regsSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            teamName: (d.teamName as string) || "",
            competitionId: (d.competitionId as string) || "",
            managerName: (d.managerName as string) || "",
            status: (d.status as string) || "Pending",
            submittedAt: (d.submittedAt as string) || "",
          };
        });
        setRegistrations(regsData);
      } catch {
        setRegistrations([]);
      }

      setLoading(false);
    };

    fetchData();
  }, [open, uid, email]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-left hover:text-primary transition-colors cursor-pointer">
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b border-border/40">
          <SheetTitle className="uppercase tracking-widest text-sm font-bold">
            ประวัติผู้ใช้
          </SheetTitle>
          <SheetDescription>
            {displayName} ({email})
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="orders">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="orders" className="flex-1 gap-1.5 text-xs">
                <ShoppingCart size={14} />
                ประวัติสั่งซื้อ
              </TabsTrigger>
              <TabsTrigger value="teams" className="flex-1 gap-1.5 text-xs">
                <UsersIcon size={14} />
                ประวัติสมัครทีม
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-sm" />
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-border/30 rounded-sm"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-bold">
                        ฿{order.price.toLocaleString()}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-wider",
                          statusBadgeClass(order.status)
                        )}
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-16 text-xs text-muted-foreground italic">
                  ยังไม่มีประวัติสั่งซื้อ
                </p>
              )}
            </TabsContent>

            <TabsContent value="teams" className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-sm" />
                ))
              ) : registrations.length > 0 ? (
                registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-4 border border-border/30 rounded-sm"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{reg.teamName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        ผู้จัดการ: {reg.managerName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(reg.submittedAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wider",
                        statusBadgeClass(reg.status)
                      )}
                    >
                      {reg.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center py-16 text-xs text-muted-foreground italic">
                  ยังไม่มีประวัติสมัครทีม
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
