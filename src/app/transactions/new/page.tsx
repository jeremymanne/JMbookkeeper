import { Header } from "@/components/layout/header";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { getCategories } from "@/app/categories/actions";
import { getVendors } from "@/app/vendors/actions";

export default async function NewTransactionPage() {
  const [categories, vendors] = await Promise.all([
    getCategories(),
    getVendors(true),
  ]);
  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <>
      <Header title="Log Expense" />
      <div className="p-6 max-w-2xl">
        <TransactionForm
          categories={activeCategories}
          vendors={vendors}
        />
      </div>
    </>
  );
}
