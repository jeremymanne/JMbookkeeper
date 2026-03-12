"use server";

import { prisma } from "@/lib/prisma";
import { categorySchema, type CategoryFormData } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getCategories(type?: string) {
  const where = type ? { type } : {};
  return prisma.category.findMany({
    where,
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { transactions: true } },
    },
  });
}

export async function createCategory(data: CategoryFormData) {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  try {
    const category = await prisma.category.create({ data: parsed.data });
    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true as const, data: category };
  } catch (e) {
    return { success: false as const, error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, data: CategoryFormData) {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true as const, data: category };
  } catch (e) {
    return { success: false as const, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const count = await prisma.transaction.count({
      where: { categoryId: id },
    });
    if (count > 0) {
      return {
        success: false as const,
        error: `Cannot delete: ${count} transaction(s) use this category. Reassign them first.`,
      };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: "Failed to delete category" };
  }
}

export async function toggleCategoryActive(id: string, isActive: boolean) {
  try {
    await prisma.category.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: "Failed to update category" };
  }
}

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Advertising & Marketing", color: "#EF4444", sortOrder: 1 },
  { name: "Software & Subscriptions", color: "#F59E0B", sortOrder: 2 },
  { name: "Contract Labor", color: "#EC4899", sortOrder: 3 },
  { name: "Office Supplies", color: "#84CC16", sortOrder: 4 },
  { name: "Travel & Transportation", color: "#14B8A6", sortOrder: 5 },
  { name: "Meals & Entertainment", color: "#F97316", sortOrder: 6 },
  { name: "Professional Services", color: "#6366F1", sortOrder: 7 },
  { name: "Insurance", color: "#0EA5E9", sortOrder: 8 },
  { name: "Taxes & Licenses", color: "#DC2626", sortOrder: 9 },
  { name: "Utilities & Internet", color: "#A855F7", sortOrder: 10 },
  { name: "Education & Training", color: "#22D3EE", sortOrder: 11 },
  { name: "Bank Fees", color: "#78716C", sortOrder: 12 },
  { name: "Rent & Lease", color: "#2563EB", sortOrder: 13 },
  { name: "Equipment & Hardware", color: "#059669", sortOrder: 14 },
  { name: "Shipping & Postage", color: "#D97706", sortOrder: 15 },
  { name: "Miscellaneous", color: "#9CA3AF", sortOrder: 16 },
];

export async function seedDefaultCategories() {
  try {
    const existing = await prisma.category.findMany({
      where: { type: "expense" },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));

    const toCreate = DEFAULT_EXPENSE_CATEGORIES.filter(
      (cat) => !existingNames.has(cat.name.toLowerCase())
    );

    if (toCreate.length === 0) {
      return { success: true as const, created: 0 };
    }

    await prisma.category.createMany({
      data: toCreate.map((cat) => ({ ...cat, type: "expense" })),
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    return { success: true as const, created: toCreate.length };
  } catch (e) {
    return { success: false as const, error: "Failed to seed categories" };
  }
}
