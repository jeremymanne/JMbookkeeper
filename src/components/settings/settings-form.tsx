"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { updateSettings } from "@/app/settings/actions";
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
import { Separator } from "@/components/ui/separator";

interface SettingsFormProps {
  settings: Record<string, string>;
}

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    defaultValues: {
      business_name: settings.business_name ?? "",
      business_address: settings.business_address ?? "",
      business_email: settings.business_email ?? "",
      business_phone: settings.business_phone ?? "",
      invoice_prefix: settings.invoice_prefix ?? "INV-",
      next_invoice_number: settings.next_invoice_number ?? "1001",
      default_payment_terms: settings.default_payment_terms ?? "Net 30",
      default_tax_rate: settings.default_tax_rate ?? "0",
      remit_payment_info: settings.remit_payment_info ?? "",
      fiscal_year_start: settings.fiscal_year_start ?? "january",
    },
  });

  function onSubmit(data: Record<string, string>) {
    startTransition(async () => {
      const result = await updateSettings(data);
      if (result.success) {
        toast.success("Settings saved");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              placeholder="Your Business Name"
              {...form.register("business_name")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_address">Address</Label>
            <Textarea
              id="business_address"
              placeholder="123 Main St, City, State ZIP"
              rows={2}
              {...form.register("business_address")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_email">Email</Label>
              <Input
                id="business_email"
                type="email"
                placeholder="you@business.com"
                {...form.register("business_email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_phone">Phone</Label>
              <Input
                id="business_phone"
                placeholder="(555) 123-4567"
                {...form.register("business_phone")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
              <Input
                id="invoice_prefix"
                placeholder="INV-"
                {...form.register("invoice_prefix")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_invoice_number">Next Invoice Number</Label>
              <Input
                id="next_invoice_number"
                type="number"
                {...form.register("next_invoice_number")}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_payment_terms">Default Payment Terms</Label>
              <Input
                id="default_payment_terms"
                placeholder="Net 30"
                {...form.register("default_payment_terms")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_tax_rate">Default Tax Rate (%)</Label>
              <Input
                id="default_tax_rate"
                type="number"
                step="0.01"
                placeholder="0"
                {...form.register("default_tax_rate")}
              />
            </div>
          </div>
          <Separator className="my-2" />
          <div className="space-y-2">
            <Label htmlFor="remit_payment_info">Remit Payment Information</Label>
            <Textarea
              id="remit_payment_info"
              placeholder={"Make checks payable to: Your Company Name\nMail to: 123 Main St, City, State ZIP\n\nOr pay via bank transfer:\nBank: Your Bank\nRouting #: 000000000\nAccount #: 000000000"}
              rows={5}
              {...form.register("remit_payment_info")}
            />
            <p className="text-xs text-gray-500">
              This appears at the bottom of every invoice.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fiscal Year */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fiscal Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Fiscal Year Start Month</Label>
            <Select
              value={form.watch("fiscal_year_start")}
              onValueChange={(val) => form.setValue("fiscal_year_start", val)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
