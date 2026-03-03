import { format, startOfMonth, endOfMonth } from "date-fns";
import { Header } from "@/components/layout/header";
import { PnLReportDisplay } from "@/components/reports/pnl-report";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { getPnL } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ReportsPage({ searchParams }: Props) {
  const params = await searchParams;
  const now = new Date();
  const from = params.from ?? format(startOfMonth(now), "yyyy-MM-dd");
  const to = params.to ?? format(endOfMonth(now), "yyyy-MM-dd");

  const report = await getPnL(from, to);

  return (
    <>
      <Header title="Profit & Loss" />
      <div className="p-6 space-y-6">
        <DateRangePicker />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              P&L Statement: {format(new Date(from), "MMM d, yyyy")} &mdash;{" "}
              {format(new Date(to), "MMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PnLReportDisplay
              incomeCategories={report.incomeCategories}
              expenseCategories={report.expenseCategories}
              totalIncome={report.totalIncome}
              totalExpenses={report.totalExpenses}
              netProfit={report.netProfit}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
