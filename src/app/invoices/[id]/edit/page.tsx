import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { getInvoice } from "@/app/invoices/actions";
import { getClients } from "@/app/clients/actions";
import { getSettings } from "@/app/settings/actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: Props) {
  const { id } = await params;
  const [invoice, clients, settings] = await Promise.all([
    getInvoice(id),
    getClients(true),
    getSettings(),
  ]);

  if (!invoice) return notFound();

  return (
    <>
      <Header title={`Edit Invoice ${invoice.invoiceNumber}`} />
      <div className="p-6 max-w-4xl">
        <InvoiceForm
          clients={clients}
          nextInvoiceNumber={invoice.invoiceNumber}
          defaultTaxRate={settings.default_tax_rate ?? "0"}
          invoice={invoice}
        />
      </div>
    </>
  );
}
