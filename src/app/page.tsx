import Link from "next/link";
import { Header } from "@/components/layout/header";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { ExpenseBreakdownChart } from "@/components/dashboard/expense-breakdown-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { getDashboardData } from "./dashboard-actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <>
      <Header title="Dashboard">
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/transactions/new?type=expense">Log Expense</Link>
          </Button>
          <Button asChild>
            <Link href="/transactions/new?type=income">
              <Plus className="h-4 w-4 mr-2" />
              Log Income
            </Link>
          </Button>
        </div>
      </Header>
      <div className="p-6 space-y-6">
        <SummaryCards
          mtdIncome={data.mtdIncome}
          mtdExpenses={data.mtdExpenses}
          mtdNet={data.mtdNet}
          ytdNet={data.ytdNet}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeExpenseChart data={data.monthlyData} />
          <ExpenseBreakdownChart data={data.expenseBreakdown} />
        </div>

        <RecentTransactions transactions={data.recentTransactions} />
      </div>
    </>
  );
}
