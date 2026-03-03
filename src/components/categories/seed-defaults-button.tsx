"use client";

import { useTransition } from "react";
import { seedDefaultCategories } from "@/app/categories/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ListPlus } from "lucide-react";

export function SeedDefaultsButton() {
  const [isPending, startTransition] = useTransition();

  function handleSeed() {
    startTransition(async () => {
      const result = await seedDefaultCategories();
      if (result.success) {
        if (result.created === 0) {
          toast.info("All default categories already exist");
        } else {
          toast.success(`Added ${result.created} default expense categories`);
        }
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button variant="outline" onClick={handleSeed} disabled={isPending}>
      <ListPlus className="h-4 w-4 mr-2" />
      {isPending ? "Loading..." : "Load Defaults"}
    </Button>
  );
}
