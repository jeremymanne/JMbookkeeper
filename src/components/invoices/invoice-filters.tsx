"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
}

interface InvoiceFiltersProps {
  clients: Client[];
  currentStatus: string;
  currentClientId: string;
}

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
];

export function InvoiceFilters({
  clients,
  currentStatus,
  currentClientId,
}: InvoiceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigate(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/invoices?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Status tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {STATUS_TABS.map((tab) => (
          <Button
            key={tab.value}
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-md px-4 h-8",
              currentStatus === tab.value
                ? "bg-white shadow-sm text-gray-900 font-medium"
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => navigate({ status: tab.value === "all" ? "" : tab.value })}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Client filter */}
      <Select
        value={currentClientId || "all"}
        onValueChange={(val) =>
          navigate({ clientId: val === "all" ? "" : val })
        }
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="All Clients" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Clients</SelectItem>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
