"use client";

import { useTransition, useState } from "react";
import { format } from "date-fns";
import { markInvoicePaid, markInvoiceUnpaid } from "@/app/invoices/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle } from "lucide-react";

interface InvoiceStatusActionsProps {
  invoiceId: string;
  currentStatus: string;
}

export function InvoiceStatusActions({
  invoiceId,
  currentStatus,
}: InvoiceStatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paidDate, setPaidDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [paymentNote, setPaymentNote] = useState("");

  function handleMarkPaid() {
    startTransition(async () => {
      const result = await markInvoicePaid(
        invoiceId,
        paymentNote || undefined,
        paidDate
      );
      if (result.success) {
        toast.success("Marked as paid");
        setDialogOpen(false);
        setPaymentNote("");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleMarkUnpaid() {
    startTransition(async () => {
      const result = await markInvoiceUnpaid(invoiceId);
      if (result.success) {
        toast.success("Marked as unpaid");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (currentStatus === "paid") {
    return (
      <Button variant="outline" size="sm" onClick={handleMarkUnpaid} disabled={isPending}>
        <XCircle className="h-4 w-4 mr-1 text-orange-500" />
        {isPending ? "Updating..." : "Mark as Unpaid"}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => {
          setPaidDate(format(new Date(), "yyyy-MM-dd"));
          setDialogOpen(true);
        }}
        disabled={isPending}
        className="bg-green-600 hover:bg-green-700"
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Mark as Paid
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Invoice as Paid</DialogTitle>
            <DialogDescription>
              Enter the date payment was received and any notes about the payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paidDate">Date Paid</Label>
              <Input
                id="paidDate"
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentNote">Payment Note (optional)</Label>
              <Textarea
                id="paymentNote"
                placeholder="e.g., Client paid invoices #1001 and #1002 together via wire transfer"
                rows={3}
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkPaid}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending ? "Saving..." : "Confirm Paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
