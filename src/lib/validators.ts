import { z } from "zod/v4";

export const CATEGORY_TYPES = ["income", "expense"] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export const TRANSACTION_TYPES = ["income", "expense"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const PAYMENT_METHODS = [
  "cash",
  "check",
  "credit_card",
  "debit_card",
  "bank_transfer",
  "ach",
  "wire",
  "other",
] as const;

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(CATEGORY_TYPES),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color"),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const transactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amount: z.number().positive("Amount must be positive"),
  date: z.date(),
  description: z.string().min(1, "Description is required").max(500),
  categoryId: z.string().min(1, "Category is required"),
  vendorId: z.string().nullable().optional(),
  vendor: z.string().max(200).optional().or(z.literal("")),
  source: z.string().max(200).optional().or(z.literal("")),
  paymentMethod: z.string().optional().or(z.literal("")),
  referenceNumber: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  isRecurring: z.boolean(),
  invoiceId: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const vendorSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  company: z.string().max(200).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(50).optional().or(z.literal("")),
  zip: z.string().max(20).optional().or(z.literal("")),
  taxId: z.string().max(20).optional().or(z.literal("")),
  isActive: z.boolean(),
  notes: z.string().optional().or(z.literal("")),
});

export type VendorFormData = z.infer<typeof vendorSchema>;

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  contactName: z.string().max(200).optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(50).optional().or(z.literal("")),
  zip: z.string().max(20).optional().or(z.literal("")),
  isActive: z.boolean(),
  notes: z.string().optional().or(z.literal("")),
  monthlyRetainer: z.number().min(0),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const INVOICE_STATUSES = ["unpaid", "paid"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required").max(500),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  amount: z.number(),
});

export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  status: z.enum(INVOICE_STATUSES),
  issueDate: z.date(),
  clientId: z.string().nullable().optional(),
  clientName: z.string().max(200).optional().or(z.literal("")),
  clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  clientAddress: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  taxRate: z.number().min(0).max(100),
  items: z.array(invoiceItemSchema).min(1, "At least one line item is required"),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string().optional(),
});
