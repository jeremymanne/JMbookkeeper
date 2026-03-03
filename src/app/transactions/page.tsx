import Link from "next/link";
import { Header } from "@/components/layout/header";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { getTransactions } from "./actions";
import { getCategories } from "@/app/categories/actions";
import { getVendors } from "@/app/vendors/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function TransactionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const [categories, vendors] = await Promise.all([
    getCategories(),
    getVendors(),
  ]);
  const { transactions, total, page, totalPages } = await getTransactions({
    type: params.type,
    categoryId: params.categoryId,
    vendorId: params.vendorId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    search: params.search,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <>
      <Header title="Transactions">
        <Button asChild>
          <Link href="/transactions/new">
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
          </Link>
        </Button>
      </Header>
      <div className="p-6 space-y-4">
        <TransactionFilters categories={categories} vendors={vendors} />
        <Card>
          <CardContent className="p-0">
            <TransactionTable
              transactions={transactions}
              page={page}
              totalPages={totalPages}
              total={total}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
