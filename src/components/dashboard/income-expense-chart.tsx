"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface IncomeExpenseChartProps {
  data: MonthlyData[];
  avgMonthlyExpenses?: number;
}

export function IncomeExpenseChart({ data, avgMonthlyExpenses }: IncomeExpenseChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) =>
                `$${(value / 1000).toFixed(0)}k`
              }
            />
            <Tooltip
              formatter={(value) =>
                `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              }
            />
            <Legend />
            <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
            {avgMonthlyExpenses != null && avgMonthlyExpenses > 0 && (
              <ReferenceLine
                y={avgMonthlyExpenses}
                stroke="#f97316"
                strokeDasharray="6 3"
                label={{
                  value: `Avg: $${avgMonthlyExpenses.toLocaleString("en-US", { minimumFractionDigits: 0 })}`,
                  position: "right",
                  fill: "#f97316",
                  fontSize: 12,
                }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
