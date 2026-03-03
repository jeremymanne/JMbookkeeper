"use server";

import { prisma } from "@/lib/prisma";
import { transactionSchema, type TransactionFormData } from "@/lib/validators";
import { revalidatePath } from "next/cache";

interface TransactionFilters {
  type?: string;
  categoryId?: string;
  vendorId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getTransactions(filters: TransactionFilters = {}) {
  const { type, categoryId, vendorId, dateFrom, dateTo, search, page = 1, pageSize = 25 } = filters;

  const where: Record<string, unknown> = {};

  if (type && type !== "all") {
    where.type = type;
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (vendorId) {
    where.vendorId = vendorId;
  }
  if (dateFrom || dateTo) {
    where.date = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
    };
  }
  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { vendor: { contains: search, mode: "insensitive" } },
      { source: { contains: search, mode: "insensitive" } },
      { referenceNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        category: true,
        invoice: { select: { id: true, invoiceNumber: true } },
      },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getTransaction(id: string) {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      category: true,
      invoice: { select: { id: true, invoiceNumber: true } },
    },
  });
}

export async function createTransaction(data: TransactionFormData) {
  const parsed = transactionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  try {
    const d = parsed.data;
    const invoiceId = d.invoiceId || null;
    const transaction = await prisma.transaction.create({
      data: {
        type: d.type,
        amount: d.amount,
        date: d.date,
        description: d.description,
        categoryId: d.categoryId || null,
        vendorId: d.vendorId || null,
        vendor: d.vendor || null,
        source: d.source || null,
        paymentMethod: d.paymentMethod || null,
        referenceNumber: d.referenceNumber || null,
        notes: d.notes || null,
        isRecurring: d.isRecurring,
        invoiceId,
      },
    });

    if (invoiceId) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "paid" },
      });
      revalidatePath("/invoices");
      revalidatePath(`/invoices/${invoiceId}`);
    }

    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true as const, data: transaction };
  } catch (e) {
    return { success: false as const, error: "Failed to create transaction" };
  }
}

export async function updateTransaction(id: string, data: TransactionFormData) {
  const parsed = transactionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  try {
    const d = parsed.data;
    const newInvoiceId = d.invoiceId || null;

    const existing = await prisma.transaction.findUnique({
      where: { id },
      select: { invoiceId: true },
    });
    const oldInvoiceId = existing?.invoiceId ?? null;

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        type: d.type,
        amount: d.amount,
        date: d.date,
        description: d.description,
        categoryId: d.categoryId || null,
        vendorId: d.vendorId || null,
        vendor: d.vendor || null,
        source: d.source || null,
        paymentMethod: d.paymentMethod || null,
        referenceNumber: d.referenceNumber || null,
        notes: d.notes || null,
        isRecurring: d.isRecurring,
        invoiceId: newInvoiceId,
      },
    });

    // If invoice link changed, update statuses
    if (oldInvoiceId !== newInvoiceId) {
      if (oldInvoiceId) {
        // Check if old invoice still has other linked transactions
        const remaining = await prisma.transaction.count({
          where: { invoiceId: oldInvoiceId },
        });
        if (remaining === 0) {
          await prisma.invoice.update({
            where: { id: oldInvoiceId },
            data: { status: "unpaid", paymentNote: null },
          });
        }
        revalidatePath(`/invoices/${oldInvoiceId}`);
      }
      if (newInvoiceId) {
        await prisma.invoice.update({
          where: { id: newInvoiceId },
          data: { status: "paid" },
        });
        revalidatePath(`/invoices/${newInvoiceId}`);
      }
      revalidatePath("/invoices");
    }

    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true as const, data: transaction };
  } catch (e) {
    return { success: false as const, error: "Failed to update transaction" };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const existing = await prisma.transaction.findUnique({
      where: { id },
      select: { invoiceId: true },
    });
    const invoiceId = existing?.invoiceId ?? null;

    await prisma.transaction.delete({ where: { id } });

    if (invoiceId) {
      const remaining = await prisma.transaction.count({
        where: { invoiceId },
      });
      if (remaining === 0) {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: "unpaid", paymentNote: null },
        });
      }
      revalidatePath("/invoices");
      revalidatePath(`/invoices/${invoiceId}`);
    }

    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: "Failed to delete transaction" };
  }
}
