"use server";

import { prisma } from "@/lib/prisma";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  differenceInMonths,
  eachMonthOfInterval,
} from "date-fns";

export type TimeFrame =
  | "this_month"
  | "last_month"
  | "past_3"
  | "past_6"
  | "past_12"
  | "custom";

export interface DashboardFilters {
  timeFrame: TimeFrame;
  from?: string; // ISO date string
  to?: string;   // ISO date string
}

function getDateRange(filters: DashboardFilters): { start: Date; end: Date } {
  const now = new Date();

  switch (filters.timeFrame) {
    case "this_month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "last_month": {
      const last = subMonths(now, 1);
      return { start: startOfMonth(last), end: endOfMonth(last) };
    }
    case "past_3":
      return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
    case "past_6":
      return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
    case "past_12":
      return { start: startOfMonth(subMonths(now, 11)), end: endOfMonth(now) };
    case "custom":
      return {
        start: filters.from ? new Date(filters.from) : startOfMonth(now),
        end: filters.to ? new Date(filters.to) : endOfMonth(now),
      };
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

function getPeriodLabel(filters: DashboardFilters): string {
  switch (filters.timeFrame) {
    case "this_month":
      return "This Month";
    case "last_month":
      return "Last Month";
    case "past_3":
      return "Past 3 Months";
    case "past_6":
      return "Past 6 Months";
    case "past_12":
      return "Past 12 Months";
    case "custom":
      return "Custom Range";
    default:
      return "This Month";
  }
}

export async function getDashboardData(filters?: DashboardFilters) {
  const resolvedFilters: DashboardFilters = filters ?? { timeFrame: "this_month" };
  const { start, end } = getDateRange(resolvedFilters);
  const periodLabel = getPeriodLabel(resolvedFilters);

  // Period transactions
  const periodTransactions = await prisma.transaction.findMany({
    where: { date: { gte: start, lte: end } },
  });

  const periodIncome = periodTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const periodExpenses = periodTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Monthly breakdown for chart - span the date range
  const months = eachMonthOfInterval({ start, end });
  const monthlyData = months.map((monthDate) => {
    const mStart = startOfMonth(monthDate);
    const mEnd = endOfMonth(monthDate);

    const monthTxns = periodTransactions.filter((t) => {
      const d = new Date(t.date);
      return d >= mStart && d <= mEnd;
    });

    const income = monthTxns
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTxns
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: format(monthDate, "MMM yyyy"),
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
    };
  });

  // Compute average monthly expenses from chart data
  const monthsWithExpenses = monthlyData.filter((m) => m.expenses > 0);
  const avgMonthlyExpenses =
    monthsWithExpenses.length > 0
      ? Math.round(
          (monthsWithExpenses.reduce((sum, m) => sum + m.expenses, 0) /
            monthsWithExpenses.length) *
            100
        ) / 100
      : 0;

  // Expense breakdown by category (within period)
  const expensesByCategory = await prisma.transaction.findMany({
    where: {
      type: "expense",
      date: { gte: start, lte: end },
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

  // Recent transactions (always show latest regardless of filter)
  const recentTransactions = await prisma.transaction.findMany({
    take: 10,
    orderBy: { date: "desc" },
    include: { category: true },
  });

  // Outstanding invoices
  const unpaidInvoices = await prisma.invoice.findMany({
    where: { status: "unpaid" },
    select: { total: true },
  });
  const outstandingCount = unpaidInvoices.length;
  const outstandingTotal = unpaidInvoices.reduce(
    (sum, inv) => sum + inv.total,
    0
  );

  // Retainer clients (active clients with monthlyRetainer > 0)
  const retainerClients = await prisma.client.findMany({
    where: {
      isActive: true,
      monthlyRetainer: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      monthlyRetainer: true,
    },
    orderBy: { name: "asc" },
  });

  const totalMonthlyRetainer = retainerClients.reduce(
    (sum, c) => sum + (c.monthlyRetainer ?? 0),
    0
  );

  return {
    periodLabel,
    periodIncome: Math.round(periodIncome * 100) / 100,
    periodExpenses: Math.round(periodExpenses * 100) / 100,
    periodNet: Math.round((periodIncome - periodExpenses) * 100) / 100,
    avgMonthlyExpenses,
    outstandingCount,
    outstandingTotal: Math.round(outstandingTotal * 100) / 100,
    monthlyData,
    expenseBreakdown,
    recentTransactions,
    retainerClients: retainerClients.map((c) => ({
      id: c.id,
      name: c.name,
      monthlyRetainer: c.monthlyRetainer ?? 0,
    })),
    totalMonthlyRetainer: Math.round(totalMonthlyRetainer * 100) / 100,
  };
}
