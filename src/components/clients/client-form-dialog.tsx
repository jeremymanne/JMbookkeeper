"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, type ClientFormData } from "@/lib/validators";
import { createClient, updateClient } from "@/app/clients/actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface ClientFormDialogProps {
  client?: {
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
    monthlyRetainer: number | null;
  };
  trigger?: React.ReactNode;
  onCreated?: (client: { id: string; name: string }) => void;
}

export function ClientFormDialog({ client, trigger, onCreated }: ClientFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEditing = !!client;

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name ?? "",
      contactName: client?.contactName ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      address: client?.address ?? "",
      city: client?.city ?? "",
      state: client?.state ?? "",
      zip: client?.zip ?? "",
      isActive: client?.isActive ?? true,
      notes: client?.notes ?? "",
      monthlyRetainer: client?.monthlyRetainer ?? 0,
    },
  });

  function onSubmit(data: ClientFormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateClient(client!.id, data)
        : await createClient(data);

      if (result.success) {
        toast.success(isEditing ? "Client updated" : "Client created");
        setOpen(false);
        form.reset();
        if (!isEditing && result.data && onCreated) {
          onCreated({ id: result.data.id, name: result.data.name });
        }
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Client" : "New Client"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Company / Client Name *</Label>
              <Input
                id="client-name"
                {...form.register("name")}
                placeholder="Company name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-contactName">Contact Person</Label>
              <Input
                id="client-contactName"
                {...form.register("contactName")}
                placeholder="Primary contact"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                {...form.register("email")}
                placeholder="client@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Phone</Label>
              <Input
                id="client-phone"
                {...form.register("phone")}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-address">Address</Label>
            <Input
              id="client-address"
              {...form.register("address")}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-city">City</Label>
              <Input
                id="client-city"
                {...form.register("city")}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-state">State</Label>
              <Input
                id="client-state"
                {...form.register("state")}
                placeholder="ST"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-zip">ZIP</Label>
              <Input
                id="client-zip"
                {...form.register("zip")}
                placeholder="12345"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-notes">Notes</Label>
            <Textarea
              id="client-notes"
              {...form.register("notes")}
              placeholder="Additional notes (optional)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-retainer">Monthly Retainer ($)</Label>
            <Input
              id="client-retainer"
              type="number"
              min="0"
              step="0.01"
              {...form.register("monthlyRetainer", { valueAsNumber: true })}
              placeholder="0.00"
            />
            {form.formState.errors.monthlyRetainer && (
              <p className="text-sm text-red-500">
                {form.formState.errors.monthlyRetainer.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
