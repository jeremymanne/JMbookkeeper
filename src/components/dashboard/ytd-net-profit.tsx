import { formatCurrency } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface YtdNetProfitProps {
  value: number;
}

export function YtdNetProfit({ value }: YtdNetProfitProps) {
  const isPositive = value >= 0;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 shrink-0">
      <div className={`p-1 rounded ${isPositive ? "bg-emerald-50" : "bg-red-50"}`}>
        <Calendar className={`h-3.5 w-3.5 ${isPositive ? "text-emerald-600" : "text-red-600"}`} />
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xs text-muted-foreground whitespace-nowrap">2026 YTD</span>
        <span className={`text-sm font-semibold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
          {formatCurrency(value)}
        </span>
      </div>
    </div>
  );
}
