import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";

interface SummaryCardsProps {
  mtdIncome: number;
  mtdExpenses: number;
  mtdNet: number;
  ytdNet: number;
}

export function SummaryCards({
  mtdIncome,
  mtdExpenses,
  mtdNet,
  ytdNet,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Income (MTD)",
      value: mtdIncome,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Expenses (MTD)",
      value: mtdExpenses,
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Net Profit (MTD)",
      value: mtdNet,
      icon: DollarSign,
      color: mtdNet >= 0 ? "text-green-600" : "text-red-600",
      bg: mtdNet >= 0 ? "bg-green-50" : "bg-red-50",
    },
    {
      title: "Net Profit (YTD)",
      value: ytdNet,
      icon: Calendar,
      color: ytdNet >= 0 ? "text-green-600" : "text-red-600",
      bg: ytdNet >= 0 ? "bg-green-50" : "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
}
