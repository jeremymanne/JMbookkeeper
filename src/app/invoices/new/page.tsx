import { Header } from "@/components/layout/header";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { getClients } from "@/app/clients/actions";
import { getNextInvoiceNumber } from "@/app/invoices/actions";
import { getSettings } from "@/app/settings/actions";

export default async function NewInvoicePage() {
  const [clients, nextInvoiceNumber, settings] = await Promise.all([
    getClients(true),
    getNextInvoiceNumber(),
    getSettings(),
  ]);

  return (
    <>
      <Header title="New Invoice" />
      <div className="p-6 max-w-4xl">
        <InvoiceForm
          clients={clients}
          nextInvoiceNumber={nextInvoiceNumber}
          defaultTaxRate={settings.default_tax_rate ?? "0"}
        />
      </div>
    </>
  );
}
