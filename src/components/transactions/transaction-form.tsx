"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionFormData, PAYMENT_METHODS } from "@/lib/validators";
import { createTransaction, updateTransaction } from "@/app/transactions/actions";
import { VendorFormDialog } from "@/components/vendors/vendor-form-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface Vendor {
  id: string;
  name: string;
}

interface UnpaidInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
}

interface TransactionFormProps {
  categories: Category[];
  vendors: Vendor[];
  unpaidInvoices?: UnpaidInvoice[];
  transaction?: {
    id: string;
    type: string;
    amount: number;
    date: Date | string;
    description: string;
    vendor: string | null;
    vendorId: string | null;
    source: string | null;
    paymentMethod: string | null;
    referenceNumber: string | null;
    notes: string | null;
    isRecurring: boolean;
    categoryId: string | null;
    invoiceId: string | null;
  };
}

export function TransactionForm({ categories, vendors: initialVendors, unpaidInvoices = [], transaction }: TransactionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [vendors, setVendors] = useState(initialVendors);
  const isEditing = !!transaction;

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: (transaction?.type as "income" | "expense") ?? "expense",
      amount: transaction?.amount ?? 0,
      date: transaction?.date
        ? new Date(transaction.date)
        : new Date(),
      description: transaction?.description ?? "",
      categoryId: transaction?.categoryId ?? null,
      vendorId: transaction?.vendorId ?? null,
      vendor: transaction?.vendor ?? "",
      source: transaction?.source ?? "",
      paymentMethod: transaction?.paymentMethod ?? "",
      referenceNumber: transaction?.referenceNumber ?? "",
      notes: transaction?.notes ?? "",
      isRecurring: transaction?.isRecurring ?? false,
      invoiceId: transaction?.invoiceId ?? null,
    },
  });

  const watchType = form.watch("type");
  const filteredCategories = categories.filter(
    (c) => c.type === watchType
  );

  function onSubmit(data: TransactionFormData) {
    startTransition(async () => {
      // Set vendor display name from selected vendor
      if (data.vendorId) {
        const selectedVendor = vendors.find((v) => v.id === data.vendorId);
        if (selectedVendor) {
          data.vendor = selectedVendor.name;
        }
      }

      const result = isEditing
        ? await updateTransaction(transaction!.id, data)
        : await createTransaction(data);

      if (result.success) {
        toast.success(
          isEditing ? "Transaction updated" : "Transaction created"
        );
        router.push("/transactions");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleVendorCreated(vendor: { id: string; name: string }) {
    setVendors((prev) => [...prev, vendor].sort((a, b) => a.name.localeCompare(b.name)));
    form.setValue("vendorId", vendor.id);
    form.setValue("vendor", vendor.name);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Type Toggle */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              {(["expense", "income"] as const).map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={watchType === t ? "default" : "outline"}
                  className={
                    watchType === t
                      ? t === "income"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                      : ""
                  }
                  onClick={() => {
                    form.setValue("type", t);
                    form.setValue("categoryId", null);
                    if (t === "expense") {
                      form.setValue("invoiceId", null);
                    }
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date", { valueAsDate: true })}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.watch("categoryId") ?? ""}
                onValueChange={(val) => form.setValue("categoryId", val || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vendor (dropdown) / Source (text) */}
            {watchType === "expense" ? (
              <div className="space-y-2">
                <Label>Vendor</Label>
                <div className="flex gap-2">
                  <Select
                    value={form.watch("vendorId") ?? "none"}
                    onValueChange={(val) => {
                      const vendorId = val === "none" ? null : val;
                      form.setValue("vendorId", vendorId);
                      if (vendorId) {
                        const v = vendors.find((v) => v.id === vendorId);
                        if (v) form.setValue("vendor", v.name);
                      } else {
                        form.setValue("vendor", "");
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No vendor</SelectItem>
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <VendorFormDialog
                    onCreated={handleVendorCreated}
                    trigger={
                      <Button type="button" variant="outline" size="icon" title="New Vendor">
                        <Plus className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  placeholder="Who paid you?"
                  {...form.register("source")}
                />
              </div>
            )}
          </div>

          {/* Link to Invoice (income only) */}
          {watchType === "income" && unpaidInvoices.length > 0 && (
            <div className="space-y-2">
              <Label>Link to Invoice</Label>
              <Select
                value={form.watch("invoiceId") ?? "none"}
                onValueChange={(val) =>
                  form.setValue("invoiceId", val === "none" ? null : val)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No invoice</SelectItem>
                  {unpaidInvoices.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.clientName} ($
                      {inv.total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={form.watch("paymentMethod") ?? ""}
                onValueChange={(val) => form.setValue("paymentMethod", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reference Number */}
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Reference #</Label>
              <Input
                id="referenceNumber"
                placeholder="Check #, transaction ID, etc."
                {...form.register("referenceNumber")}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes (optional)"
              rows={3}
              {...form.register("notes")}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/transactions")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Transaction"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
