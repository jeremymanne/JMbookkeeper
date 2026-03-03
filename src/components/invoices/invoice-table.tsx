"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteInvoice, markInvoicePaid, markInvoiceUnpaid } from "@/app/invoices/actions";
import { formatCurrency, formatDate } from "@/lib/utils";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: Date | string;
  paidDate: Date | string | null;
  clientName: string;
  total: number;
}

interface InvoiceTableProps {
  invoices: Invoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, invoiceNumber: string) {
    if (!confirm(`Delete invoice ${invoiceNumber}? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteInvoice(id);
      if (result.success) {
        toast.success("Invoice deleted");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleTogglePaid(id: string, currentStatus: string) {
    startTransition(async () => {
      const result = currentStatus === "paid"
        ? await markInvoiceUnpaid(id)
        : await markInvoicePaid(id);
      if (result.success) {
        toast.success(currentStatus === "paid" ? "Marked as unpaid" : "Marked as paid");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">No invoices found</p>
        <p className="mt-1 text-sm">Create your first invoice to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Date Sent</TableHead>
          <TableHead>Date Paid</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell>
              <Link
                href={`/invoices/${inv.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {inv.invoiceNumber}
              </Link>
            </TableCell>
            <TableCell>{inv.clientName}</TableCell>
            <TableCell>{formatDate(inv.issueDate)}</TableCell>
            <TableCell>
              {inv.paidDate ? formatDate(inv.paidDate) : "—"}
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(inv.total)}
            </TableCell>
            <TableCell className="text-center">
              <Badge
                variant="secondary"
                className={
                  inv.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }
              >
                {inv.status === "paid" ? "Paid" : "Unpaid"}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {inv.status === "unpaid" ? (
                    <DropdownMenuItem
                      onClick={() => handleTogglePaid(inv.id, inv.status)}
                      disabled={isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Mark as Paid
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => handleTogglePaid(inv.id, inv.status)}
                      disabled={isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2 text-orange-500" /> Mark as Unpaid
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => router.push(`/invoices/${inv.id}`)}>
                    <Eye className="h-4 w-4 mr-2" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/invoices/${inv.id}/edit`)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
