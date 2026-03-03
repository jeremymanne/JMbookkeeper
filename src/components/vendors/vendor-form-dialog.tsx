"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorSchema, type VendorFormData } from "@/lib/validators";
import { createVendor, updateVendor } from "@/app/vendors/actions";
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
import { Plus, Pencil } from "lucide-react";

interface VendorFormDialogProps {
  vendor?: {
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
  };
  trigger?: React.ReactNode;
  onCreated?: (vendor: { id: string; name: string }) => void;
}

export function VendorFormDialog({ vendor, trigger, onCreated }: VendorFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEditing = !!vendor;

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: vendor?.name ?? "",
      company: vendor?.company ?? "",
      email: vendor?.email ?? "",
      phone: vendor?.phone ?? "",
      address: vendor?.address ?? "",
      city: vendor?.city ?? "",
      state: vendor?.state ?? "",
      zip: vendor?.zip ?? "",
      taxId: vendor?.taxId ?? "",
      isActive: vendor?.isActive ?? true,
      notes: vendor?.notes ?? "",
    },
  });

  function onSubmit(data: VendorFormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateVendor(vendor!.id, data)
        : await createVendor(data);

      if (result.success) {
        toast.success(isEditing ? "Vendor updated" : "Vendor created");
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
            Add Vendor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Vendor" : "New Vendor"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-name">Name *</Label>
              <Input
                id="vendor-name"
                {...form.register("name")}
                placeholder="Contact name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-company">Company</Label>
              <Input
                id="vendor-company"
                {...form.register("company")}
                placeholder="Company name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-email">Email</Label>
              <Input
                id="vendor-email"
                type="email"
                {...form.register("email")}
                placeholder="vendor@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-phone">Phone</Label>
              <Input
                id="vendor-phone"
                {...form.register("phone")}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-address">Address</Label>
            <Input
              id="vendor-address"
              {...form.register("address")}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-city">City</Label>
              <Input
                id="vendor-city"
                {...form.register("city")}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-state">State</Label>
              <Input
                id="vendor-state"
                {...form.register("state")}
                placeholder="ST"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-zip">ZIP</Label>
              <Input
                id="vendor-zip"
                {...form.register("zip")}
                placeholder="12345"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-taxId">Tax ID / EIN</Label>
            <Input
              id="vendor-taxId"
              {...form.register("taxId")}
              placeholder="XX-XXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-notes">Notes</Label>
            <Textarea
              id="vendor-notes"
              {...form.register("notes")}
              placeholder="Additional notes (optional)"
              rows={2}
            />
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
                  : "Create Vendor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
