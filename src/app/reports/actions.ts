"use server";

import { prisma } from "@/lib/prisma";

interface PnLCategory {
  categoryId: string | null;
  categoryName: string;
  categoryColor: string;
  total: number;
}

interface PnLReport {
  startDate: string;
  endDate: string;
  incomeCategories: PnLCategory[];
  expenseCategories: PnLCategory[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export async function getPnL(startDate: string, endDate: string): Promise<PnLReport> {
  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate + "T23:59:59"),
      },
    },
    include: { category: true },
  });

  const incomeMap = new Map<string, PnLCategory>();
  const expenseMap = new Map<string, PnLCategory>();

  for (const txn of transactions) {
    const map = txn.type === "income" ? incomeMap : expenseMap;
    const key = txn.categoryId || "uncategorized";
    const existing = map.get(key);
    if (existing) {
      existing.total += txn.amount;
    } else {
      map.set(key, {
        categoryId: txn.categoryId,
        categoryName: txn.category?.name || "Uncategorized",
        categoryColor: txn.category?.color || "#9CA3AF",
        total: txn.amount,
      });
    }
  }

  const incomeCategories = Array.from(incomeMap.values())
    .map((c) => ({ ...c, total: Math.round(c.total * 100) / 100 }))
    .sort((a, b) => b.total - a.total);

  const expenseCategories = Array.from(expenseMap.values())
    .map((c) => ({ ...c, total: Math.round(c.total * 100) / 100 }))
    .sort((a, b) => b.total - a.total);

  const totalIncome = incomeCategories.reduce((s, c) => s + c.total, 0);
  const totalExpenses = expenseCategories.reduce((s, c) => s + c.total, 0);

  return {
    startDate,
    endDate,
    incomeCategories,
    expenseCategories,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netProfit: Math.round((totalIncome - totalExpenses) * 100) / 100,
  };
}
