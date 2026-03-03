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
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: "Failed to update category" };
  }
}
