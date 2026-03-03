"use client";

import { useTransition } from "react";
import { toggleVendorActive } from "@/app/vendors/actions";
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
import { VendorFormDialog } from "./vendor-form-dialog";
import { DeleteVendorDialog } from "./delete-vendor-dialog";
import { Pencil } from "lucide-react";

function maskTaxId(taxId: string | null): string {
  if (!taxId) return "—";
  if (taxId.length <= 4) return taxId;
  return "***-**-" + taxId.slice(-4);
}

interface VendorWithCount {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  taxId: string | null;
  isActive: boolean;
  notes: string | null;
  _count: { transactions: number };
}

interface VendorTableProps {
  vendors: VendorWithCount[];
}

export function VendorTable({ vendors }: VendorTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggleActive(id: string, currentActive: boolean) {
    startTransition(async () => {
      const result = await toggleVendorActive(id, !currentActive);
      if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No vendors found. Create one to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Tax ID / EIN</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead className="text-center">Transactions</TableHead>
          <TableHead className="text-center">Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vendors.map((vendor) => (
          <TableRow key={vendor.id}>
            <TableCell className="font-medium">{vendor.name}</TableCell>
            <TableCell>{vendor.company || "—"}</TableCell>
            <TableCell>
              <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                {maskTaxId(vendor.taxId)}
              </code>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {vendor.email && <div>{vendor.email}</div>}
                {vendor.phone && <div className="text-muted-foreground">{vendor.phone}</div>}
              </div>
            </TableCell>
            <TableCell className="text-center">
              {vendor._count.transactions}
            </TableCell>
            <TableCell className="text-center">
              <Checkbox
                checked={vendor.isActive}
                onCheckedChange={() =>
                  handleToggleActive(vendor.id, vendor.isActive)
                }
                disabled={isPending}
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <VendorFormDialog
                  vendor={vendor}
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                />
                <DeleteVendorDialog
                  vendorId={vendor.id}
                  vendorName={vendor.name}
                  transactionCount={vendor._count.transactions}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
