"use client";

import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface PnLCategory {
  categoryName: string;
  categoryColor: string;
  total: number;
}

interface PnLReportDisplayProps {
  incomeCategories: PnLCategory[];
  expenseCategories: PnLCategory[];
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
}

export function PnLReportDisplay({
  incomeCategories,
  expenseCategories,
  totalIncome,
  totalExpenses,
  netProfit,
}: PnLReportDisplayProps) {
  return (
    <div className="bg-white rounded-lg border p-6 font-mono text-sm">
      {/* Income Section */}
      <h3 className="text-base font-bold mb-3 text-gray-900">INCOME</h3>
      {incomeCategories.length === 0 ? (
        <p className="text-muted-foreground ml-4 mb-2">No income recorded</p>
      ) : (
        <div className="space-y-1 ml-4 mb-3">
          {incomeCategories.map((cat) => (
            <div
              key={cat.categoryName}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: cat.categoryColor }}
                />
                <span>{cat.categoryName}</span>
              </div>
              <span className="text-green-600">{formatCurrency(cat.total)}</span>
            </div>
          ))}
        </div>
      )}
      <Separator className="my-2" />
      <div className="flex justify-between font-bold mb-6">
        <span>TOTAL INCOME</span>
        <span className="text-green-600">{formatCurrency(totalIncome)}</span>
      </div>

      {/* Expense Section */}
      <h3 className="text-base font-bold mb-3 text-gray-900">EXPENSES</h3>
      {expenseCategories.length === 0 ? (
        <p className="text-muted-foreground ml-4 mb-2">No expenses recorded</p>
      ) : (
        <div className="space-y-1 ml-4 mb-3">
          {expenseCategories.map((cat) => (
            <div
              key={cat.categoryName}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: cat.categoryColor }}
                />
                <span>{cat.categoryName}</span>
              </div>
              <span className="text-red-600">{formatCurrency(cat.total)}</span>
            </div>
          ))}
        </div>
      )}
      <Separator className="my-2" />
      <div className="flex justify-between font-bold mb-6">
        <span>TOTAL EXPENSES</span>
        <span className="text-red-600">{formatCurrency(totalExpenses)}</span>
      </div>

      {/* Net Profit */}
      <div className="border-t-2 border-double border-gray-900 pt-3">
        <div className="flex justify-between text-base font-bold">
          <span>NET PROFIT {netProfit < 0 ? "(LOSS)" : ""}</span>
          <span className={netProfit >= 0 ? "text-green-600" : "text-red-600"}>
            {formatCurrency(netProfit)}
          </span>
        </div>
      </div>
    </div>
  );
}
