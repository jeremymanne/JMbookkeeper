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
import { FileText } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: Date;
  dueDate: Date | null;
  total: number;
  items: { id: string; description: string; quantity: number; unitPrice: number; amount: number }[];
}

interface ClientInvoiceTableProps {
  invoices: Invoice[];
}

export function ClientInvoiceTable({ invoices }: ClientInvoiceTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Invoices
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {invoices.length} total
        </span>
      </CardHeader>
      <CardContent className="p-0">
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No invoices yet for this client.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(inv.issueDate)}</TableCell>
                  <TableCell>
                    {inv.dueDate ? formatDate(inv.dueDate) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={inv.status === "paid" ? "default" : "secondary"}
                      className={
                        inv.status === "paid"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(inv.total)}
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
