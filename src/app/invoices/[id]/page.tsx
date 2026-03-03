import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import { InvoiceStatusActions } from "@/components/invoices/invoice-status-actions";
import { getInvoice } from "@/app/invoices/actions";
import { getSettings } from "@/app/settings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, CreditCard } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoiceViewPage({ params }: Props) {
  const { id } = await params;
  const [invoice, settings] = await Promise.all([
    getInvoice(id),
    getSettings(),
  ]);

  if (!invoice) return notFound();

  const hasPaymentInfo =
    invoice.status === "paid" &&
    (invoice.transactions.length > 0 || invoice.paymentNote);

  return (
    <>
      <Header title={`Invoice ${invoice.invoiceNumber}`}>
        <div className="flex items-center gap-2 print:hidden">
          <InvoiceStatusActions invoiceId={invoice.id} currentStatus={invoice.status} />
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          </Link>
        </div>
      </Header>
      <div className="p-6">
        {hasPaymentInfo && (
          <Card className="mb-6 print:hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.transactions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Linked Transactions
                  </p>
                  <ul className="space-y-1">
                    {invoice.transactions.map((txn) => (
                      <li key={txn.id} className="text-sm">
                        <Link
                          href={`/transactions/${txn.id}/edit`}
                          className="text-blue-600 hover:underline"
                        >
                          {txn.description}
                        </Link>
                        <span className="text-muted-foreground">
                          {" — "}${txn.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          on{" "}
                          {new Date(txn.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {invoice.paymentNote && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Payment Note
                  </p>
                  <p className="text-sm">{invoice.paymentNote}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        <InvoicePreview
          invoice={invoice}
          businessName={settings.business_name ?? ""}
          businessAddress={settings.business_address ?? ""}
          businessEmail={settings.business_email ?? ""}
          businessPhone={settings.business_phone ?? ""}
          remitPaymentInfo={settings.remit_payment_info ?? ""}
        />
      </div>
    </>
  );
}
