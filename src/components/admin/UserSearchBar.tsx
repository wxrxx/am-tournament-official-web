"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserSearchBarProps {
  onSearch: (term: string) => void;
}

export default function UserSearchBar({ onSearch }: UserSearchBarProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  const handleClear = useCallback(() => {
    setValue("");
  }, []);

  return (
    <div className="relative max-w-sm">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ค้นหาชื่อหรืออีเมล..."
        className="pl-9 pr-9 rounded-sm h-9 text-sm"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
}
