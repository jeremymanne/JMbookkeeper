"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteTransaction } from "@/app/transactions/actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: Date | string;
  description: string;
  vendor: string | null;
  source: string | null;
  paymentMethod: string | null;
  category: { id: string; name: string; color: string } | null;
}

interface TransactionTableProps {
  transactions: Transaction[];
  page: number;
  totalPages: number;
  total: number;
}

export function TransactionTable({
  transactions,
  page,
  totalPages,
  total,
}: TransactionTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/transactions?${params.toString()}`);
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteTransaction(deleteId);
      if (result.success) {
        toast.success("Transaction deleted");
      } else {
        toast.error(result.error);
      }
      setDeleteId(null);
    });
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No transactions found. Create one to get started.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((txn) => (
            <TableRow key={txn.id}>
              <TableCell className="whitespace-nowrap">
                {formatDate(txn.date)}
              </TableCell>
              <TableCell>
                <div>
                  <span className="font-medium">{txn.description}</span>
                  {(txn.vendor || txn.source) && (
                    <span className="text-sm text-muted-foreground ml-2">
                      {txn.type === "expense" ? txn.vendor : txn.source}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {txn.category && (
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: txn.category.color }}
                    />
                    <span className="text-sm">{txn.category.name}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    txn.type === "income"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {txn.type}
                </Badge>
              </TableCell>
              <TableCell
                className={`text-right font-medium whitespace-nowrap ${
                  txn.type === "income" ? "text-green-600" : "text-red-600"
                }`}
              >
                {txn.type === "income" ? "+" : "-"}
                {formatCurrency(txn.amount)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground capitalize">
                {txn.paymentMethod?.replace("_", " ") ?? ""}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/transactions/${txn.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => setDeleteId(txn.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <span className="text-sm text-muted-foreground">
          {total} transaction{total !== 1 ? "s" : ""} total
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
