"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceFormData } from "@/lib/validators";
import { createInvoice, updateInvoice } from "@/app/invoices/actions";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}

interface InvoiceFormProps {
  clients: Client[];
  nextInvoiceNumber: string;
  defaultTaxRate: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    issueDate: Date | string;
    clientId: string | null;
    clientName: string;
    clientEmail: string | null;
    clientAddress: string | null;
    notes: string | null;
    taxRate: number;
    items: {
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }[];
  };
}

export function InvoiceForm({
  clients: initialClients,
  nextInvoiceNumber,
  defaultTaxRate,
  invoice,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clients, setClients] = useState(initialClients);
  const isEditing = !!invoice;

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: invoice?.invoiceNumber ?? nextInvoiceNumber,
      status: (invoice?.status as InvoiceFormData["status"]) ?? "unpaid",
      issueDate: invoice?.issueDate
        ? new Date(invoice.issueDate)
        : new Date(),
      clientId: invoice?.clientId ?? null,
      clientName: invoice?.clientName ?? "",
      clientEmail: invoice?.clientEmail ?? "",
      clientAddress: invoice?.clientAddress ?? "",
      notes: invoice?.notes ?? "",
      taxRate: invoice?.taxRate ?? (parseFloat(defaultTaxRate) || 0),
      items: invoice?.items?.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      })) ?? [{ description: "", quantity: 1, unitPrice: 0, amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const watchTaxRate = form.watch("taxRate");

  const subtotal = watchItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = subtotal * ((watchTaxRate || 0) / 100);
  const total = subtotal + taxAmount;

  function recalcItem(index: number) {
    const qty = form.getValues(`items.${index}.quantity`) || 0;
    const price = form.getValues(`items.${index}.unitPrice`) || 0;
    form.setValue(`items.${index}.amount`, Math.round(qty * price * 100) / 100);
  }

  function handleClientSelect(clientId: string) {
    if (clientId === "none") {
      form.setValue("clientId", null);
      form.setValue("clientName", "");
      form.setValue("clientEmail", "");
      form.setValue("clientAddress", "");
      return;
    }
    form.setValue("clientId", clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      form.setValue("clientName", client.name);
      form.setValue("clientEmail", client.email ?? "");
      const parts = [client.address, client.city, client.state, client.zip]
        .filter(Boolean);
      form.setValue("clientAddress", parts.join(", "));
    }
  }

  function handleClientCreated(client: { id: string; name: string }) {
    setClients((prev) =>
      [...prev, { ...client, contactName: null, email: null, phone: null, address: null, city: null, state: null, zip: null }]
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    form.setValue("clientId", client.id);
    form.setValue("clientName", client.name);
  }

  function onSubmit(data: InvoiceFormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateInvoice(invoice!.id, data)
        : await createInvoice(data);

      if (result.success) {
        toast.success(isEditing ? "Invoice updated" : "Invoice created");
        router.push("/invoices");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice #</Label>
              <Input
                id="invoiceNumber"
                {...form.register("invoiceNumber")}
                readOnly={isEditing}
                className={isEditing ? "bg-gray-50" : ""}
              />
              {form.formState.errors.invoiceNumber && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.invoiceNumber.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="issueDate">Date Sent</Label>
              <Input
                id="issueDate"
                type="date"
                {...form.register("issueDate", { valueAsDate: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(val) =>
                  form.setValue("status", val as InvoiceFormData["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bill To</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Client</Label>
            <div className="flex gap-2">
              <Select
                value={form.watch("clientId") ?? "none"}
                onValueChange={handleClientSelect}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Manual Entry --</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ClientFormDialog
                onCreated={handleClientCreated}
                trigger={
                  <Button type="button" variant="outline" size="icon" title="New Client">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              placeholder="Client or company name"
              {...form.register("clientName")}
            />
            {form.formState.errors.clientName && (
              <p className="text-sm text-red-500">
                {form.formState.errors.clientName.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="client@example.com"
                {...form.register("clientEmail")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Client Address</Label>
              <Input
                id="clientAddress"
                placeholder="123 Main St, City, State ZIP"
                {...form.register("clientAddress")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.formState.errors.items?.message && (
            <p className="text-sm text-red-500">
              {form.formState.errors.items.message}
            </p>
          )}

          <div className="hidden sm:grid sm:grid-cols-[1fr_80px_120px_120px_40px] gap-2 text-xs font-semibold text-gray-500 uppercase px-1">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit Price</span>
            <span className="text-right">Amount</span>
            <span />
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_80px_120px_120px_40px] gap-2 items-start"
            >
              <div>
                <Input
                  placeholder="Description"
                  {...form.register(`items.${index}.description`)}
                />
                {form.formState.errors.items?.[index]?.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {form.formState.errors.items[index].description?.message}
                  </p>
                )}
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Qty"
                {...form.register(`items.${index}.quantity`, {
                  valueAsNumber: true,
                  onChange: () => recalcItem(index),
                })}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                {...form.register(`items.${index}.unitPrice`, {
                  valueAsNumber: true,
                  onChange: () => recalcItem(index),
                })}
              />
              <Input
                type="number"
                step="0.01"
                readOnly
                className="bg-gray-50"
                {...form.register(`items.${index}.amount`, {
                  valueAsNumber: true,
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700"
                onClick={() => fields.length > 1 && remove(index)}
                disabled={fields.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ description: "", quantity: 1, unitPrice: 0, amount: 0 })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Line Item
          </Button>

          {/* Totals */}
          <div className="flex justify-end pt-4">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm items-center gap-2">
                <span className="text-gray-600">Tax Rate (%)</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-20 text-right h-8"
                  {...form.register("taxRate", { valueAsNumber: true })}
                />
              </div>
              {watchTaxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes (optional)"
              rows={3}
              {...form.register("notes")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/invoices")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}
