"use server";

import { prisma } from "@/lib/prisma";

export async function getClientDashboard(clientId: string) {
  const [client, invoices, transactions, invoiceAggregates, expenseAggregate] =
    await Promise.all([
      prisma.client.findUnique({
        where: { id: clientId },
      }),
      prisma.invoice.findMany({
        where: { clientId },
        include: { items: true },
        orderBy: { issueDate: "desc" },
      }),
      prisma.transaction.findMany({
        where: { clientId },
        include: { category: true },
        orderBy: { date: "desc" },
      }),
      prisma.invoice.groupBy({
        by: ["status"],
        where: { clientId },
        _sum: { total: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { clientId, type: "expense" },
        _sum: { amount: true },
      }),
    ]);

  if (!client) return null;

  // Compute summary stats from aggregates
  const statusMap = new Map(
    invoiceAggregates.map((a) => [
      a.status,
      { total: a._sum.total ?? 0, count: a._count },
    ])
  );

  const totalInvoiced = invoiceAggregates.reduce(
    (sum, a) => sum + (a._sum.total ?? 0),
    0
  );
  const totalPaid = statusMap.get("paid")?.total ?? 0;
  const outstanding = statusMap.get("unpaid")?.total ?? 0;
  const unpaidCount = statusMap.get("unpaid")?.count ?? 0;
  const totalExpenses = expenseAggregate._sum.amount ?? 0;

  // Build unified activity feed (10 most recent invoices + transactions)
  type ActivityItem =
    | { type: "invoice"; date: Date; id: string; label: string; amount: number; status: string }
    | { type: "transaction"; date: Date; id: string; label: string; amount: number; txnType: string };

  const invoiceActivities: ActivityItem[] = invoices.map((inv) => ({
    type: "invoice" as const,
    date: new Date(inv.issueDate),
    id: inv.id,
    label: `Invoice ${inv.invoiceNumber}`,
    amount: inv.total,
    status: inv.status,
  }));

  const transactionActivities: ActivityItem[] = transactions.map((txn) => ({
    type: "transaction" as const,
    date: new Date(txn.date),
    id: txn.id,
    label: txn.description,
    amount: txn.amount,
    txnType: txn.type,
  }));

  const activity = [...invoiceActivities, ...transactionActivities]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  return {
    client,
    summary: {
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      outstanding: Math.round(outstanding * 100) / 100,
      unpaidCount,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      monthlyRetainer: client.monthlyRetainer ?? 0,
    },
    invoices,
    transactions,
    activity,
  };
}
