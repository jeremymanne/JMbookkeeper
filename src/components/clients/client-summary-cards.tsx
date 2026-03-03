import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { FileText, CheckCircle, AlertCircle, TrendingDown, RefreshCw } from "lucide-react";

interface ClientSummaryCardsProps {
  summary: {
    totalInvoiced: number;
    totalPaid: number;
    outstanding: number;
    unpaidCount: number;
    totalExpenses: number;
    monthlyRetainer: number;
  };
}

export function ClientSummaryCards({ summary }: ClientSummaryCardsProps) {
  const cards = [
    {
      title: "Total Invoiced",
      value: summary.totalInvoiced,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Paid",
      value: summary.totalPaid,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Outstanding",
      value: summary.outstanding,
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      subtitle: summary.unpaidCount > 0
        ? `${summary.unpaidCount} unpaid`
        : undefined,
    },
    {
      title: "Total Expenses",
      value: summary.totalExpenses,
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Monthly Retainer",
      value: summary.monthlyRetainer,
      icon: RefreshCw,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {formatCurrency(card.value)}
            </div>
            {"subtitle" in card && card.subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {card.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
