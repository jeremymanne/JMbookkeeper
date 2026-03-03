import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import { getInvoices } from "./actions";
import { getClients } from "@/app/clients/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function InvoicesPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = params.status ?? "all";
  const clientId = params.clientId ?? "";
  const search = params.search ?? "";
  const page = parseInt(params.page ?? "1", 10);

  const [{ invoices, total, totalPages }, clients] = await Promise.all([
    getInvoices({ status, clientId: clientId || undefined, search, page }),
    getClients(),
  ]);

  const unpaidTotal = invoices
    .filter((inv) => inv.status === "unpaid")
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <>
      <Header title="Invoices">
        <Link href="/invoices/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> New Invoice
          </Button>
        </Link>
      </Header>
      <div className="p-6 space-y-4">
        {/* Summary bar */}
        {status !== "paid" && unpaidTotal > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-amber-800">
              Outstanding balance{clientId ? " for this client" : ""}
            </span>
            <span className="text-lg font-bold text-amber-900">
              {formatCurrency(unpaidTotal)}
            </span>
          </div>
        )}

        {/* Filters */}
        <Suspense>
          <InvoiceFilters
            clients={clients}
            currentStatus={status}
            currentClientId={clientId}
          />
        </Suspense>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            <InvoiceTable invoices={invoices} />
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-gray-500">
                <span>
                  Showing {invoices.length} of {total} invoices
                </span>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link
                      href={`/invoices?page=${page - 1}&status=${status}&clientId=${clientId}&search=${search}`}
                    >
                      <Button variant="outline" size="sm">
                        Previous
                      </Button>
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link
                      href={`/invoices?page=${page + 1}&status=${status}&clientId=${clientId}&search=${search}`}
                    >
                      <Button variant="outline" size="sm">
                        Next
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
