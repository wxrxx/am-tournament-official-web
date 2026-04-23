"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentSnapshot,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { UserProfile, UserRole, EditUserPayload } from "@/types/user";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import UserSearchBar from "./UserSearchBar";
import UserRoleDropdown from "./UserRoleDropdown";
import UserBanButton from "./UserBanButton";
import UserEditDialog from "./UserEditDialog";
import UserDeleteButton from "./UserDeleteButton";
import UserHistoryDrawer from "./UserHistoryDrawer";

const PAGE_SIZE = 10;

export default function UserTable() {
  const { user } = useAuth();
  const currentAdminUid = user?.id || "";

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Cursor tracking
  const lastDocRef = useRef<DocumentSnapshot | null>(null);
  const cursorStackRef = useRef<DocumentSnapshot[]>([]);

  const fetchUsers = useCallback(async (afterDoc?: DocumentSnapshot) => {
    setLoading(true);

    let q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE + 1)
    );

    if (afterDoc) {
      q = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        startAfter(afterDoc),
        limit(PAGE_SIZE + 1)
      );
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    const hasMore = docs.length > PAGE_SIZE;

    const pageData: UserProfile[] = docs.slice(0, PAGE_SIZE).map((doc) => {
      const d = doc.data();
      return {
        uid: doc.id,
        displayName: (d.displayName as string) || "",
        email: (d.email as string) || "",
        photoURL: (d.photoURL as string) || undefined,
        role: ((d.role as string) || "user") as UserRole,
        banned: (d.banned as boolean) || false,
        createdAt: d.createdAt,
      };
    });

    setUsers(pageData);
    setHasNextPage(hasMore);

    if (pageData.length > 0) {
      lastDocRef.current = docs[Math.min(docs.length - 1, PAGE_SIZE - 1)];
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const goToNextPage = () => {
    if (!lastDocRef.current || !hasNextPage) return;
    cursorStackRef.current.push(lastDocRef.current);

    // We need to re-fetch from the last doc of the current page
    // Find the actual last doc of current page
    fetchUsers(lastDocRef.current);
    setCurrentPage((p) => p + 1);
  };

  const goToPrevPage = () => {
    if (currentPage <= 1) return;

    cursorStackRef.current.pop(); // Remove current cursor
    const prevCursor = cursorStackRef.current.length > 0
      ? cursorStackRef.current[cursorStackRef.current.length - 1]
      : undefined;

    // For page 1, we go back to no cursor (from start)
    if (currentPage === 2) {
      cursorStackRef.current = [];
      fetchUsers();
    } else {
      fetchUsers(prevCursor);
    }
    setCurrentPage((p) => p - 1);
  };

  // Callbacks for child components to optimistically update state
  const handleRoleChanged = useCallback((uid: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
    );
  }, []);

  const handleBanChanged = useCallback((uid: string, banned: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, banned } : u))
    );
  }, []);

  const handleUserEdited = useCallback((uid: string, data: EditUserPayload) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.uid === uid ? { ...u, ...data } : u
      )
    );
  }, []);

  const handleUserDeleted = useCallback((uid: string) => {
    setUsers((prev) => prev.filter((u) => u.uid !== uid));
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Client-side search filtering
  const filteredUsers = searchTerm
    ? users.filter(
        (u) =>
          u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  const formatDate = (ts: unknown) => {
    if (!ts) return "-";
    if (typeof ts === "object" && ts !== null && "toDate" in ts) {
      return (ts as { toDate: () => Date }).toDate().toLocaleDateString("th-TH");
    }
    return "-";
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <UserSearchBar onSearch={handleSearch} />
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          หน้า {currentPage}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-border/40 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[280px] uppercase tracking-widest text-[10px] font-bold">
                ผู้ใช้
              </TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">
                อีเมล
              </TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">
                Role
              </TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">
                สถานะ
              </TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">
                วันสมัคร
              </TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">
                จัดการ
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <TableRow key={u.uid} className="group hover:bg-muted/10 transition-colors">
                  {/* User Info */}
                  <TableCell>
                    <UserHistoryDrawer
                      uid={u.uid}
                      displayName={u.displayName}
                      email={u.email}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={u.photoURL} />
                          <AvatarFallback className="text-[10px] font-bold bg-muted">
                            {getInitials(u.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {u.displayName}
                        </span>
                      </div>
                    </UserHistoryDrawer>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="text-xs text-muted-foreground">
                    {u.email}
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <UserRoleDropdown
                      uid={u.uid}
                      currentRole={u.role}
                      currentAdminUid={currentAdminUid}
                      onRoleChanged={handleRoleChanged}
                    />
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5",
                        u.banned
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full mr-1.5 inline-block",
                          u.banned ? "bg-red-500" : "bg-emerald-500"
                        )}
                      />
                      {u.banned ? "Banned" : "Active"}
                    </Badge>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <UserEditDialog
                        uid={u.uid}
                        displayName={u.displayName}
                        email={u.email}
                        currentAdminUid={currentAdminUid}
                        onUserEdited={handleUserEdited}
                      />
                      <UserBanButton
                        uid={u.uid}
                        displayName={u.displayName}
                        banned={u.banned}
                        currentAdminUid={currentAdminUid}
                        onStatusChanged={handleBanChanged}
                      />
                      <UserDeleteButton
                        uid={u.uid}
                        displayName={u.displayName}
                        currentAdminUid={currentAdminUid}
                        onUserDeleted={handleUserDeleted}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-48 text-center text-muted-foreground text-xs italic"
                >
                  {searchTerm
                    ? `ไม่พบผู้ใช้ที่ตรงกับ "${searchTerm}"`
                    : "ไม่มีผู้ใช้ในระบบ"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm"
          >
            <ChevronLeft size={14} />
            ก่อนหน้า
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={!hasNextPage}
            className="gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm"
          >
            ถัดไป
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
