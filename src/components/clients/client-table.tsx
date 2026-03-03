"use client";

import { useTransition } from "react";
import { toggleClientActive, deleteClient } from "@/app/clients/actions";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientFormDialog } from "./client-form-dialog";
import { Pencil, Trash2 } from "lucide-react";

interface ClientWithCount {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  isActive: boolean;
  notes: string | null;
  _count: { invoices: number };
}

interface ClientTableProps {
  clients: ClientWithCount[];
}

export function ClientTable({ clients }: ClientTableProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggleActive(id: string, currentActive: boolean) {
    startTransition(async () => {
      const result = await toggleClientActive(id, !currentActive);
      if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete client "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteClient(id);
      if (result.success) {
        toast.success("Client deleted");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No clients found. Add your first client to start invoicing.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-center">Invoices</TableHead>
          <TableHead className="text-center">Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.name}</TableCell>
            <TableCell>{client.contactName || "—"}</TableCell>
            <TableCell>
              <div className="text-sm">
                {client.email && <div>{client.email}</div>}
                {client.phone && (
                  <div className="text-muted-foreground">{client.phone}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              {[client.city, client.state].filter(Boolean).join(", ") || "—"}
            </TableCell>
            <TableCell className="text-center">
              {client._count.invoices}
            </TableCell>
            <TableCell className="text-center">
              <Checkbox
                checked={client.isActive}
                onCheckedChange={() =>
                  handleToggleActive(client.id, client.isActive)
                }
                disabled={isPending}
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <ClientFormDialog
                  client={client}
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(client.id, client.name)}
                  disabled={isPending || client._count.invoices > 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
