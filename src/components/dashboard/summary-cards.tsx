import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, FileText } from "lucide-react";

interface SummaryCardsProps {
  periodLabel: string;
  periodIncome: number;
  periodExpenses: number;
  periodNet: number;
  totalMonthlyRetainer: number;
  outstandingCount: number;
  outstandingTotal: number;
}

export function SummaryCards({
  periodLabel,
  periodIncome,
  periodExpenses,
  periodNet,
  totalMonthlyRetainer,
  outstandingCount,
  outstandingTotal,
}: SummaryCardsProps) {
  const cards = [
    {
      title: `Income (${periodLabel})`,
      value: periodIncome,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: `Expenses (${periodLabel})`,
      value: periodExpenses,
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: `Net Profit (${periodLabel})`,
      value: periodNet,
      icon: DollarSign,
      color: periodNet >= 0 ? "text-green-600" : "text-red-600",
      bg: periodNet >= 0 ? "bg-green-50" : "bg-red-50",
    },
    {
      title: "Monthly Retainer",
      value: totalMonthlyRetainer,
      icon: RefreshCw,
      color: "text-blue-600",
      bg: "bg-blue-50",
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
          </CardContent>
        </Card>
      ))}
      <Link href="/invoices?status=unpaid" className="block">
        <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Invoices
            </CardTitle>
            <div className="p-2 rounded-md bg-orange-50">
              <FileText className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(outstandingTotal)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {outstandingCount} unpaid invoice{outstandingCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
