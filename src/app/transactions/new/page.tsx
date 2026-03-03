import { Header } from "@/components/layout/header";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { getCategories } from "@/app/categories/actions";
import { getVendors } from "@/app/vendors/actions";
import { getUnpaidInvoices } from "@/app/invoices/actions";

export default async function NewTransactionPage() {
  const [categories, vendors, unpaidInvoices] = await Promise.all([
    getCategories(),
    getVendors(true),
    getUnpaidInvoices(),
  ]);
  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <>
      <Header title="New Transaction" />
      <div className="p-6 max-w-2xl">
        <TransactionForm
          categories={activeCategories}
          vendors={vendors}
          unpaidInvoices={unpaidInvoices}
        />
      </div>
    </>
  );
}
