import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getQuarterDates } from "@/lib/utils";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const year = parseInt(searchParams.get("year") || "");
  const quarter = parseInt(searchParams.get("quarter") || "") as 1 | 2 | 3 | 4;

  if (!year || !quarter || quarter < 1 || quarter > 4) {
    return NextResponse.json({ error: "Invalid year or quarter" }, { status: 400 });
  }

  const { start, end } = getQuarterDates(year, quarter);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: start, lte: end },
    },
    include: { category: true },
    orderBy: { date: "asc" },
  });

  // Build CSV
  const headers = [
    "Date",
    "Type",
    "Description",
    "Category",
    "Amount",
    "Vendor/Source",
    "Payment Method",
    "Reference #",
    "Notes",
  ];

  const rows = transactions.map((txn) => [
    format(new Date(txn.date), "yyyy-MM-dd"),
    txn.type,
    escapeCsv(txn.description),
    txn.category?.name || "",
    txn.amount.toFixed(2),
    escapeCsv(txn.type === "expense" ? txn.vendor || "" : txn.source || ""),
    txn.paymentMethod || "",
    txn.referenceNumber || "",
    escapeCsv(txn.notes || ""),
  ]);

  // Summary section
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const csv = [
    `BookKeeper Quarterly Export - Q${quarter} ${year}`,
    `Period: ${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`,
    "",
    `Total Income,${totalIncome.toFixed(2)}`,
    `Total Expenses,${totalExpenses.toFixed(2)}`,
    `Net Profit,${netProfit.toFixed(2)}`,
    `Transaction Count,${transactions.length}`,
    "",
    headers.join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="Q${quarter}-${year}-bookkeeper-export.csv"`,
    },
  });
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
