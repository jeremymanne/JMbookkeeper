import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { ClientInfoHeader } from "@/components/clients/client-info-header";
import { ClientSummaryCards } from "@/components/clients/client-summary-cards";
import { ClientInvoiceTable } from "@/components/clients/client-invoice-table";
import { ClientTransactionTable } from "@/components/clients/client-transaction-table";
import { ClientActivityFeed } from "@/components/clients/client-activity-feed";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { getClientDashboard } from "./actions";
import { Button } from "@/components/ui/button";
import { FileText, Pencil } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getClientDashboard(id);

  if (!data) return notFound();

  const { client, summary, invoices, transactions, activity } = data;

  return (
    <>
      <Header title={client.name}>
        <Link href={`/invoices/new?clientId=${client.id}`}>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-1" />
            New Invoice
          </Button>
        </Link>
        <ClientFormDialog
          client={client}
          trigger={
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" />
              Edit Client
            </Button>
          }
        />
      </Header>
      <div className="p-6 space-y-6">
        <ClientInfoHeader client={client} />
        <ClientSummaryCards summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ClientInvoiceTable invoices={invoices} />
          </div>
          <div>
            <ClientActivityFeed activity={activity} />
          </div>
        </div>

        <ClientTransactionTable transactions={transactions} />
      </div>
    </>
  );
}
