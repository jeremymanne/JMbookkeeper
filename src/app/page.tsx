import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { DashboardTimeFilter } from "@/components/dashboard/dashboard-time-filter";
import { RetainerSummary } from "@/components/dashboard/retainer-summary";
import { getDashboardData, type TimeFrame } from "./dashboard-actions";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{
    timeFrame?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const timeFrame = (params.timeFrame as TimeFrame) || "this_month";
  const from = params.from;
  const to = params.to;

  const data = await getDashboardData({ timeFrame, from, to });

  return (
    <>
      <Header title="Dashboard">
        <Button asChild>
          <Link href="/transactions/new">Log Expense</Link>
        </Button>
      </Header>
      <div className="p-6 space-y-6">
        <Suspense fallback={null}>
          <DashboardTimeFilter
            currentTimeFrame={timeFrame}
            currentFrom={from}
            currentTo={to}
          />
        </Suspense>

        <SummaryCards
          periodLabel={data.periodLabel}
          periodIncome={data.periodIncome}
          periodExpenses={data.periodExpenses}
          periodNet={data.periodNet}
          totalMonthlyRetainer={data.totalMonthlyRetainer}
          outstandingCount={data.outstandingCount}
          outstandingTotal={data.outstandingTotal}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <IncomeExpenseChart
              data={data.monthlyData}
              avgMonthlyExpenses={data.avgMonthlyExpenses}
            />
          </div>
          <RetainerSummary
            clients={data.retainerClients}
            totalMonthlyRetainer={data.totalMonthlyRetainer}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpenseBreakdownChart
            data={data.expenseBreakdown}
            periodLabel={data.periodLabel}
          />
          <RecentTransactions transactions={data.recentTransactions} />
        </div>
      </div>
    </>
  );
}
