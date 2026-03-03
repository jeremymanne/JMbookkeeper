"use client";

import { useState, useTransition } from "react";
import { updatePaymentNote } from "@/app/invoices/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, X } from "lucide-react";

interface PaymentNoteEditorProps {
  invoiceId: string;
  currentNote: string | null;
}

export function PaymentNoteEditor({ invoiceId, currentNote }: PaymentNoteEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(currentNote ?? "");

  function handleSave() {
    startTransition(async () => {
      const result = await updatePaymentNote(invoiceId, note);
      if (result.success) {
        toast.success("Note saved");
        setEditing(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g., Client paid invoices #1001 and #1002 together via wire transfer"
          rows={3}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            <Check className="h-3 w-3 mr-1" />
            {isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setNote(currentNote ?? ""); setEditing(false); }}
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <p className="text-sm flex-1">
        {currentNote || <span className="text-muted-foreground italic">No notes added</span>}
      </p>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={() => setEditing(true)}
      >
        <Pencil className="h-3 w-3" />
      </Button>
    </div>
  );
}
