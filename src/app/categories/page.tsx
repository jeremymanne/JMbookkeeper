import { Header } from "@/components/layout/header";
import { CategoryTable } from "@/components/categories/category-table";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { getCategories } from "./actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default async function CategoriesPage() {
  const categories = await getCategories();
  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <>
      <Header title="Categories">
        <CategoryFormDialog />
      </Header>
      <div className="p-6">
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              All ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="income">
              Income ({incomeCategories.length})
            </TabsTrigger>
            <TabsTrigger value="expense">
              Expense ({expenseCategories.length})
            </TabsTrigger>
          </TabsList>
          <Card className="mt-4">
            <CardContent className="p-0">
              <TabsContent value="all" className="m-0">
                <CategoryTable categories={categories} />
              </TabsContent>
              <TabsContent value="income" className="m-0">
                <CategoryTable categories={incomeCategories} />
              </TabsContent>
              <TabsContent value="expense" className="m-0">
                <CategoryTable categories={expenseCategories} />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </>
  );
}
