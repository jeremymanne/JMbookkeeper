"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfQuarter, endOfQuarter } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setRange(start: Date, end: Date) {
    const params = new URLSearchParams();
    params.set("from", format(start, "yyyy-MM-dd"));
    params.set("to", format(end, "yyyy-MM-dd"));
    router.push(`/reports?${params.toString()}`);
  }

  const now = new Date();

  const presets = [
    { label: "This Month", start: startOfMonth(now), end: endOfMonth(now) },
    { label: "This Quarter", start: startOfQuarter(now), end: endOfQuarter(now) },
    { label: "This Year", start: startOfYear(now), end: endOfYear(now) },
  ];

  return (
    <div className="flex flex-wrap items-end gap-3">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="outline"
          size="sm"
          onClick={() => setRange(preset.start, preset.end)}
        >
          {preset.label}
        </Button>
      ))}

      <div className="flex items-end gap-2">
        <div>
          <Label className="text-xs">From</Label>
          <Input
            type="date"
            className="w-[150px] h-9"
            defaultValue={searchParams.get("from") ?? ""}
            onChange={(e) => {
              if (e.target.value) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("from", e.target.value);
                router.push(`/reports?${params.toString()}`);
              }
            }}
          />
        </div>
        <div>
          <Label className="text-xs">To</Label>
          <Input
            type="date"
            className="w-[150px] h-9"
            defaultValue={searchParams.get("to") ?? ""}
            onChange={(e) => {
              if (e.target.value) {
                const params = new URLSearchParams(searchParams.toString());
                params.set("to", e.target.value);
                router.push(`/reports?${params.toString()}`);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
