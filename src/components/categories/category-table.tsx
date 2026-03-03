"use client";

import { useTransition } from "react";
import { toggleCategoryActive } from "@/app/categories/actions";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryFormDialog } from "./category-form-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { Pencil } from "lucide-react";

interface CategoryWithCount {
  id: string;
  name: string;
  type: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  _count: { transactions: number };
}

interface CategoryTableProps {
  categories: CategoryWithCount[];
}

export function CategoryTable({ categories }: CategoryTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggleActive(id: string, currentActive: boolean) {
    startTransition(async () => {
      const result = await toggleCategoryActive(id, !currentActive);
      if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No categories found. Create one to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">Color</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-center">Transactions</TableHead>
          <TableHead className="text-center">Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((cat) => (
          <TableRow key={cat.id}>
            <TableCell>
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            </TableCell>
            <TableCell className="font-medium">{cat.name}</TableCell>
            <TableCell>
              <Badge
                variant={cat.type === "income" ? "default" : "secondary"}
                className={
                  cat.type === "income"
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                }
              >
                {cat.type}
              </Badge>
            </TableCell>
            <TableCell className="text-center">
              {cat._count.transactions}
            </TableCell>
            <TableCell className="text-center">
              <Checkbox
                checked={cat.isActive}
                onCheckedChange={() =>
                  handleToggleActive(cat.id, cat.isActive)
                }
                disabled={isPending}
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <CategoryFormDialog
                  category={cat}
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                />
                <DeleteCategoryDialog
                  categoryId={cat.id}
                  categoryName={cat.name}
                  transactionCount={cat._count.transactions}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
