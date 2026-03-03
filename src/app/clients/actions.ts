"use server";

import { prisma } from "@/lib/prisma";
import { clientSchema, type ClientFormData } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function getClients(activeOnly?: boolean) {
  const where = activeOnly ? { isActive: true } : {};
  const clients = await prisma.client.findMany({
    where,
    orderBy: [{ name: "asc" }],
    include: {
      _count: { select: { invoices: true } },
    },
  });

  // Get outstanding invoices grouped by clientId in a single query
  const unpaidInvoices = await prisma.invoice.groupBy({
    by: ["clientId"],
    where: { status: "unpaid", clientId: { not: null } },
    _count: true,
    _sum: { total: true },
  });

  const unpaidMap = new Map(
    unpaidInvoices.map((inv) => [
      inv.clientId,
      { count: inv._count, total: inv._sum.total ?? 0 },
    ])
  );

  return clients.map((client) => ({
    ...client,
    outstandingInvoices: unpaidMap.get(client.id) ?? { count: 0, total: 0 },
  }));
}

export async function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      invoices: {
        orderBy: { issueDate: "desc" },
        take: 10,
      },
    },
  });
}

export async function createClient(data: ClientFormData) {
  const parsed = clientSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  try {
    const client = await prisma.client.create({ data: parsed.data });
    revalidatePath("/clients");
    revalidatePath("/invoices");
    return { success: true as const, data: client };
  } catch (e) {
    return { success: false as const, error: "Failed to create client" };
  }
}

export async function updateClient(id: string, data: ClientFormData) {
  const parsed = clientSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  try {
    const client = await prisma.client.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/clients");
    revalidatePath("/invoices");
    return { success: true as const, data: client };
  } catch (e) {
    return { success: false as const, error: "Failed to update client" };
  }
}

export async function deleteClient(id: string) {
  try {
    const count = await prisma.invoice.count({
      where: { clientId: id },
    });
    if (count > 0) {
      return {
        success: false as const,
        error: `Cannot delete: ${count} invoice(s) are linked to this client. Reassign them first.`,
      };
    }

    await prisma.client.delete({ where: { id } });
    revalidatePath("/clients");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: "Failed to delete client" };
  }
}

export async function toggleClientActive(id: string, isActive: boolean) {
  try {
    await prisma.client.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/clients");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: "Failed to update client" };
  }
}
