"use server";

import { prisma } from "@/lib/prisma";
import { vendorSchema, type VendorFormData } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getVendors(activeOnly?: boolean) {
  const where = activeOnly ? { isActive: true } : {};
  return prisma.vendor.findMany({
    where,
    orderBy: [{ name: "asc" }],
    include: {
      _count: { select: { transactions: true } },
    },
  });
}

export async function createVendor(data: VendorFormData) {
  const parsed = vendorSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  try {
    const vendor = await prisma.vendor.create({ data: parsed.data });
    revalidatePath("/vendors");
    revalidatePath("/transactions");
    return { success: true as const, data: vendor };
  } catch (e) {
    return { success: false as const, error: "Failed to create vendor" };
  }
}

export async function updateVendor(id: string, data: VendorFormData) {
  const parsed = vendorSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  try {
    const vendor = await prisma.vendor.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/vendors");
    revalidatePath("/transactions");
    return { success: true as const, data: vendor };
  } catch (e) {
    return { success: false as const, error: "Failed to update vendor" };
  }
}

export async function deleteVendor(id: string) {
  try {
    const count = await prisma.transaction.count({
      where: { vendorId: id },
    });
    if (count > 0) {
      return {
        success: false as const,
        error: `Cannot delete: ${count} transaction(s) use this vendor. Reassign them first.`,
      };
    }

    await prisma.vendor.delete({ where: { id } });
    revalidatePath("/vendors");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: "Failed to delete vendor" };
  }
}

export async function toggleVendorActive(id: string, isActive: boolean) {
  try {
    await prisma.vendor.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/vendors");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: "Failed to update vendor" };
  }
}
