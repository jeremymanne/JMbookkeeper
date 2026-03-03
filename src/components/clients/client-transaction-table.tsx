import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowDownUp } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: Date;
  description: string;
  category: { id: string; name: string; color: string } | null;
}

interface ClientTransactionTableProps {
  transactions: Transaction[];
}

export function ClientTransactionTable({ transactions }: ClientTransactionTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4" />
          Transactions
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {transactions.length} total
        </span>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No transactions yet for this client.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>{formatDate(txn.date)}</TableCell>
                  <TableCell>
                    <Link
                      href={`/transactions/${txn.id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      {txn.description}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {txn.category ? (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: txn.category.color }}
                        />
                        <span className="text-sm">{txn.category.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        txn.type === "income"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {txn.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={txn.type === "income" ? "text-green-600" : "text-red-600"}>
                      {txn.type === "expense" ? "−" : "+"}{formatCurrency(txn.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
