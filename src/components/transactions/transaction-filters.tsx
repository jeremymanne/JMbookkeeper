"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Vendor {
  id: string;
  name: string;
}

interface TransactionFiltersProps {
  categories: Category[];
  vendors: Vendor[];
}

export function TransactionFilters({ categories, vendors }: TransactionFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/transactions?${params.toString()}`);
    },
    [router, searchParams]
  );

  function clearFilters() {
    router.push("/transactions");
  }

  const hasFilters =
    searchParams.has("type") ||
    searchParams.has("categoryId") ||
    searchParams.has("vendorId") ||
    searchParams.has("dateFrom") ||
    searchParams.has("dateTo") ||
    searchParams.has("search");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          className="pl-9"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const timeout = setTimeout(() => {
              updateParams("search", e.target.value);
            }, 300);
            return () => clearTimeout(timeout);
          }}
        />
      </div>

      <Select
        value={searchParams.get("type") ?? "all"}
        onValueChange={(val) => updateParams("type", val)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("categoryId") ?? "all"}
        onValueChange={(val) => updateParams("categoryId", val)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("vendorId") ?? "all"}
        onValueChange={(val) => updateParams("vendorId", val)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Vendors" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Vendors</SelectItem>
          {vendors.map((v) => (
            <SelectItem key={v.id} value={v.id}>
              {v.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-[160px]"
        defaultValue={searchParams.get("dateFrom") ?? ""}
        onChange={(e) => updateParams("dateFrom", e.target.value)}
      />
      <span className="text-muted-foreground text-sm">to</span>
      <Input
        type="date"
        className="w-[160px]"
        defaultValue={searchParams.get("dateTo") ?? ""}
        onChange={(e) => updateParams("dateTo", e.target.value)}
      />

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
