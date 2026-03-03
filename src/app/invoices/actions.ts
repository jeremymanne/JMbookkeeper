"use server";

import { prisma } from "@/lib/prisma";
import { invoiceSchema, type InvoiceFormData } from "@/lib/validators";
import { revalidatePath } from "next/cache";

interface InvoiceFilters {
  status?: string;
  clientId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getInvoices(filters: InvoiceFilters = {}) {
  const { status, clientId, search, page = 1, pageSize = 25 } = filters;

  const where: Record<string, unknown> = {};

  if (status && status !== "all") {
    where.status = status;
  }
  if (clientId) {
    where.clientId = clientId;
  }
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { clientName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { items: true, clientRef: true },
      orderBy: { issueDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    invoices,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      clientRef: true,
      transactions: {
        select: { id: true, description: true, amount: true, date: true },
        orderBy: { date: "desc" },
      },
    },
  });
}

export async function getUnpaidInvoices(currentInvoiceId?: string | null) {
  const invoices = await prisma.invoice.findMany({
    where: {
      OR: [
        { status: "unpaid" },
        ...(currentInvoiceId ? [{ id: currentInvoiceId }] : []),
      ],
    },
    select: { id: true, invoiceNumber: true, clientName: true, total: true },
    orderBy: { invoiceNumber: "asc" },
  });
  return invoices;
}

export async function getNextInvoiceNumber() {
  const prefix =
    (await prisma.setting.findUnique({ where: { key: "invoice_prefix" } }))
      ?.value ?? "INV-";
  const nextNum =
    (
      await prisma.setting.findUnique({
        where: { key: "next_invoice_number" },
      })
    )?.value ?? "1001";

  return `${prefix}${nextNum}`;
}

export async function createInvoice(data: InvoiceFormData) {
  // Dates get serialized to strings across the server action boundary
  const normalized = {
    ...data,
    issueDate: data.issueDate instanceof Date ? data.issueDate : new Date(data.issueDate),
  };
  const parsed = invoiceSchema.safeParse(normalized);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    console.error("Invoice validation failed:", msg);
    return { success: false as const, error: msg };
  }

  try {
    const d = parsed.data;

    // Resolve client name: use provided name, or look up from client record
    let clientName = d.clientName || "";
    if (!clientName && d.clientId) {
      const client = await prisma.client.findUnique({
        where: { id: d.clientId },
        select: { name: true },
      });
      clientName = client?.name || "";
    }

    const subtotal = d.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (d.taxRate / 100);
    const total = subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: d.invoiceNumber,
        status: d.status,
        issueDate: d.issueDate,
        clientId: d.clientId || null,
        clientName,
        clientEmail: d.clientEmail || null,
        clientAddress: d.clientAddress || null,
        notes: d.notes || null,
        taxRate: d.taxRate,
        subtotal,
        taxAmount,
        total,
        items: {
          create: d.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        },
      },
    });

    // If created as paid, auto-create income transaction
    if (d.status === "paid") {
      let incomeCategory = await prisma.category.findFirst({
        where: { type: "income", isActive: true, name: "Client Services" },
        select: { id: true },
      });
      if (!incomeCategory) {
        incomeCategory = await prisma.category.findFirst({
          where: { type: "income", isActive: true },
          select: { id: true },
        });
      }

      await prisma.transaction.create({
        data: {
          type: "income",
          amount: total,
          date: new Date(),
          description: `Payment: ${d.invoiceNumber} — ${clientName}`,
          invoiceId: invoice.id,
          categoryId: incomeCategory?.id ?? null,
        },
      });
    }

    // Increment next invoice number
    const currentNum =
      (
        await prisma.setting.findUnique({
          where: { key: "next_invoice_number" },
        })
      )?.value ?? "1001";
    const nextNum = String(parseInt(currentNum, 10) + 1);
    await prisma.setting.upsert({
      where: { key: "next_invoice_number" },
      update: { value: nextNum },
      create: { key: "next_invoice_number", value: nextNum },
    });

    revalidatePath("/invoices");
    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true as const, data: invoice };
  } catch (e) {
    console.error("Invoice creation error:", e);
    const msg =
      e instanceof Error && e.message.includes("Unique constraint")
        ? "Invoice number already exists"
        : e instanceof Error
          ? `Failed to create invoice: ${e.message}`
          : "Failed to create invoice";
    return { success: false as const, error: msg };
  }
}

export async function updateInvoice(id: string, data: InvoiceFormData) {
  const normalized = {
    ...data,
    issueDate: data.issueDate instanceof Date ? data.issueDate : new Date(data.issueDate),
  };
  const parsed = invoiceSchema.safeParse(normalized);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  try {
    const d = parsed.data;

    let clientName = d.clientName || "";
    if (!clientName && d.clientId) {
      const client = await prisma.client.findUnique({
        where: { id: d.clientId },
        select: { name: true },
      });
      clientName = client?.name || "";
    }

    const subtotal = d.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (d.taxRate / 100);
    const total = subtotal + taxAmount;

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

    // Check previous status to handle income transaction
    const previous = await prisma.invoice.findUnique({
      where: { id },
      select: { status: true },
    });

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        invoiceNumber: d.invoiceNumber,
        status: d.status,
        issueDate: d.issueDate,
        clientId: d.clientId || null,
        clientName,
        clientEmail: d.clientEmail || null,
        clientAddress: d.clientAddress || null,
        notes: d.notes || null,
        taxRate: d.taxRate,
        subtotal,
        taxAmount,
        total,
        items: {
          create: d.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
          })),
        },
      },
    });

    // Handle status transitions for income transactions
    if (previous?.status !== "paid" && d.status === "paid") {
      // Became paid: create income transaction
      let incomeCategory = await prisma.category.findFirst({
        where: { type: "income", isActive: true, name: "Client Services" },
        select: { id: true },
      });
      if (!incomeCategory) {
        incomeCategory = await prisma.category.findFirst({
          where: { type: "income", isActive: true },
          select: { id: true },
        });
      }
      await prisma.transaction.create({
        data: {
          type: "income",
          amount: total,
          date: new Date(),
          description: `Payment: ${d.invoiceNumber} — ${clientName}`,
          invoiceId: id,
          categoryId: incomeCategory?.id ?? null,
        },
      });
    } else if (previous?.status === "paid" && d.status !== "paid") {
      // Was paid, now unpaid: remove income transaction
      await prisma.transaction.deleteMany({
        where: { invoiceId: id, type: "income" },
      });
    }

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${id}`);
    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true as const, data: invoice };
  } catch (e) {
    return { success: false as const, error: "Failed to update invoice" };
  }
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({ where: { id } });
    revalidatePath("/invoices");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: "Failed to delete invoice" };
  }
}

export async function markInvoicePaid(
  id: string,
  paymentNote?: string,
  paidDateStr?: string
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: { invoiceNumber: true, clientName: true, total: true },
    });
    if (!invoice) {
      return { success: false as const, error: "Invoice not found" };
    }

    const paidDate = paidDateStr ? new Date(paidDateStr) : new Date();

    // Find an income category to assign (prefer "Client Services" or first available)
    let incomeCategory = await prisma.category.findFirst({
      where: { type: "income", isActive: true, name: "Client Services" },
      select: { id: true },
    });
    if (!incomeCategory) {
      incomeCategory = await prisma.category.findFirst({
        where: { type: "income", isActive: true },
        select: { id: true },
      });
    }

    await prisma.$transaction([
      prisma.invoice.update({
        where: { id },
        data: {
          status: "paid",
          paymentNote: paymentNote || null,
          paidDate,
        },
      }),
      prisma.transaction.create({
        data: {
          type: "income",
          amount: invoice.total,
          date: paidDate,
          description: `Payment: ${invoice.invoiceNumber} — ${invoice.clientName}`,
          invoiceId: id,
          categoryId: incomeCategory?.id ?? null,
        },
      }),
    ]);

    revalidatePath("/invoices");
    revalidatePath(`/invoices/${id}`);
    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: "Failed to mark as paid" };
  }
}

export async function markInvoiceUnpaid(id: string) {
  try {
    await prisma.$transaction([
      // Delete auto-created income transactions linked to this invoice
      prisma.transaction.deleteMany({
        where: { invoiceId: id, type: "income" },
      }),
      prisma.invoice.update({
        where: { id },
        data: { status: "unpaid", paymentNote: null, paidDate: null },
      }),
    ]);
    revalidatePath("/invoices");
    revalidatePath(`/invoices/${id}`);
    revalidatePath("/transactions");
    revalidatePath("/");
    return { success: true as const };
  } catch (e) {
    return { success: false as const, error: "Failed to mark as unpaid" };
  }
}
