import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { getTransaction } from "@/app/transactions/actions";
import { getCategories } from "@/app/categories/actions";
import { getVendors } from "@/app/vendors/actions";
import { getClients } from "@/app/clients/actions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTransactionPage({ params }: Props) {
  const { id } = await params;
  const [transaction, categories, vendors, clients] = await Promise.all([
    getTransaction(id),
    getCategories(),
    getVendors(true),
    getClients(true),
  ]);

  if (!transaction) {
    notFound();
  }

  const activeCategories = categories.filter((c: typeof categories[number]) => c.isActive);

  return (
    <>
      <Header title="Edit Transaction" />
      <div className="p-6 max-w-2xl">
        <TransactionForm
          categories={activeCategories}
          vendors={vendors}
          clients={clients}
          transaction={transaction}
        />
      </div>
    </>
  );
}
