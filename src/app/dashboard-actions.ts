"use server";

import { prisma } from "@/lib/prisma";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  format,
} from "date-fns";

export async function getDashboardData() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  // Current month totals
  const monthTransactions = await prisma.transaction.findMany({
    where: { date: { gte: monthStart, lte: monthEnd } },
  });

  const mtdIncome = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const mtdExpenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // YTD totals
  const ytdTransactions = await prisma.transaction.findMany({
    where: { date: { gte: yearStart, lte: yearEnd } },
  });

  const ytdIncome = ytdTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const ytdExpenses = ytdTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Monthly breakdown for last 6 months (for chart)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const mStart = startOfMonth(monthDate);
    const mEnd = endOfMonth(monthDate);

    const txns = ytdTransactions.filter((t) => {
      const d = new Date(t.date);
      return d >= mStart && d <= mEnd;
    });

    // If month is outside YTD, query separately
    let monthTxns = txns;
    if (mStart < yearStart) {
      monthTxns = await prisma.transaction.findMany({
        where: { date: { gte: mStart, lte: mEnd } },
      });
    }

    const income = monthTxns
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTxns
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyData.push({
      month: format(monthDate, "MMM"),
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
    });
  }

  // Expense breakdown by category (YTD)
  const expensesByCategory = await prisma.transaction.findMany({
    where: {
      type: "expense",
      date: { gte: yearStart, lte: yearEnd },
    },
    include: { category: true },
  });

  const categoryMap = new Map<
    string,
    { name: string; color: string; total: number }
  >();
  for (const txn of expensesByCategory) {
    const key = txn.categoryId || "uncategorized";
    const existing = categoryMap.get(key);
    if (existing) {
      existing.total += txn.amount;
    } else {
      categoryMap.set(key, {
        name: txn.category?.name || "Uncategorized",
        color: txn.category?.color || "#9CA3AF",
        total: txn.amount,
      });
    }
  }

  const expenseBreakdown = Array.from(categoryMap.values())
    .map((c) => ({ ...c, total: Math.round(c.total * 100) / 100 }))
    .sort((a, b) => b.total - a.total);

  // Recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    take: 10,
    orderBy: { date: "desc" },
    include: { category: true },
  });

  return {
    mtdIncome: Math.round(mtdIncome * 100) / 100,
    mtdExpenses: Math.round(mtdExpenses * 100) / 100,
    mtdNet: Math.round((mtdIncome - mtdExpenses) * 100) / 100,
    ytdNet: Math.round((ytdIncome - ytdExpenses) * 100) / 100,
    monthlyData,
    expenseBreakdown,
    recentTransactions,
  };
}
