"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import type { TimeFrame } from "@/app/dashboard-actions";

const TIME_FRAME_OPTIONS: { value: TimeFrame; label: string }[] = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "past_3", label: "Past 3 Mo" },
  { value: "past_6", label: "Past 6 Mo" },
  { value: "past_12", label: "Past 12 Mo" },
];

interface DashboardTimeFilterProps {
  currentTimeFrame: TimeFrame;
  currentFrom?: string;
  currentTo?: string;
}

export function DashboardTimeFilter({
  currentTimeFrame,
  currentFrom,
  currentTo,
}: DashboardTimeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    currentFrom && currentTo
      ? { from: new Date(currentFrom), to: new Date(currentTo) }
      : undefined
  );

  function navigate(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.push(`/?${params.toString()}`);
  }

  function handleTimeFrame(tf: TimeFrame) {
    navigate({ timeFrame: tf, from: "", to: "" });
  }

  function handleCustomRange(range: DateRange | undefined) {
    setDateRange(range);
    if (range?.from && range?.to) {
      navigate({
        timeFrame: "custom",
        from: format(range.from, "yyyy-MM-dd"),
        to: format(range.to, "yyyy-MM-dd"),
      });
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {TIME_FRAME_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant="ghost"
            size="sm"
            className={cn(
              "rounded-md px-3 h-8 text-xs",
              currentTimeFrame === opt.value
                ? "bg-white shadow-sm text-gray-900 font-medium"
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => handleTimeFrame(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 text-xs gap-1",
              currentTimeFrame === "custom" && "border-primary text-primary"
            )}
          >
            <CalendarIcon className="h-3 w-3" />
            {currentTimeFrame === "custom" && dateRange?.from && dateRange?.to
              ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
              : "Custom Range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleCustomRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
