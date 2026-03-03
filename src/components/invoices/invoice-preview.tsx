"use client";

import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoicePreviewProps {
  invoice: {
    invoiceNumber: string;
    status: string;
    issueDate: Date | string;
    clientName: string;
    clientEmail: string | null;
    clientAddress: string | null;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    notes: string | null;
    items: InvoiceItem[];
  };
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  remitPaymentInfo: string;
}

function formatLongDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMMM d, yyyy");
}

export function InvoicePreview({
  invoice,
  businessName,
  businessAddress,
  businessEmail,
  businessPhone,
  remitPaymentInfo,
}: InvoicePreviewProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <>
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="h-4 w-4 mr-2" /> Print Invoice
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-10 max-w-3xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
        {/* Logo + INVOICE Header */}
        <div className="flex items-start justify-between mb-2">
          <Image
            src="/logo.webp"
            alt={businessName || "Company Logo"}
            width={200}
            height={60}
            className="object-contain"
            priority
          />
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            INVOICE
          </h1>
        </div>

        {/* Blue accent line */}
        <div className="h-[3px] bg-blue-500 mb-6" />

        {/* Date + Invoice # */}
        <div className="mb-6 text-sm text-gray-700">
          <p>Date: {formatLongDate(invoice.issueDate)}</p>
          <p>Invoice #: {invoice.invoiceNumber}</p>
          <p className="text-gray-500 italic">Due upon receipt</p>
        </div>

        {/* FROM and BILL TO side by side */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
              From
            </h3>
            <div className="text-sm text-gray-800 space-y-0.5">
              <p className="font-bold">{businessName || "Your Company"}</p>
              {businessAddress && (
                <p className="whitespace-pre-line">{businessAddress}</p>
              )}
              {businessEmail && <p>{businessEmail}</p>}
              {businessPhone && <p>{businessPhone}</p>}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">
              Bill To
            </h3>
            <div className="text-sm text-gray-800 space-y-0.5">
              <p className="font-bold">{invoice.clientName}</p>
              {invoice.clientAddress && (
                <p className="whitespace-pre-line">{invoice.clientAddress}</p>
              )}
              {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="text-left py-2.5 px-4 text-sm font-semibold uppercase tracking-wider">
                Description
              </th>
              <th className="text-right py-2.5 px-4 text-sm font-semibold uppercase tracking-wider w-32">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 1 ? "bg-gray-50" : "bg-white"}
              >
                <td className="py-3 px-4 text-sm text-gray-800 border-b border-gray-100">
                  {item.description}
                </td>
                <td className="py-3 px-4 text-sm text-gray-800 text-right border-b border-gray-100">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72">
            {invoice.taxRate > 0 && (
              <>
                <div className="flex justify-between text-sm py-1 px-4">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 px-4">
                  <span className="text-gray-600">
                    Tax ({invoice.taxRate}%)
                  </span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center py-2 px-4 mt-1">
              <span className="text-lg font-bold text-gray-900">TOTAL</span>
              <span className="text-lg font-bold text-gray-900 bg-amber-100 px-3 py-1 rounded">
                {formatCurrency(invoice.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">
              Notes
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Payment Details Footer */}
        {remitPaymentInfo && (
          <div className="mt-8">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">
              Payment Details
            </h3>
            <div className="border-t-2 border-blue-500 pt-3">
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {remitPaymentInfo}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
