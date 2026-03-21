"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { FieldGroup, Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { useState, useEffect } from "react";
import { PackagePlus } from "lucide-react";
import { z } from "zod";
import { ItemWithUser } from "./types";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";

const RestockSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      currentQuantity: z.number(),
      addQuantity: z.number().min(1, "Quantity must be at least 1"),
    }),
  ),
});

type RestockInput = z.infer<typeof RestockSchema>;

interface RestockItemDialogProps {
  items: ItemWithUser[];
  onSuccess?: () => void;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RestockItemDialog({
  items,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: RestockItemDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RestockInput>({
    resolver: zodResolver(RestockSchema),
    defaultValues: {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        currentQuantity: item.quantity,
        addQuantity: 1,
      })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  // Update default values when items prop changes
  useEffect(() => {
    if (open) {
      reset({
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          currentQuantity: item.quantity,
          addQuantity: 1,
        })),
      });
    }
  }, [items, reset, open]);

  const onSubmit = async (data: RestockInput) => {
    try {
      const payload = {
        items: data.items.map((i) => ({ id: i.id, quantity: i.addQuantity })),
      };

      const response = await fetch("/api/item/restock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to restock items.");
      }

      setOpen(false);
      onSuccess?.();
      toast.success(
        items.length > 1
          ? "Items restocked successfully!"
          : `Restocked ${items[0].name} successfully!`,
      );
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    }
  };

  const isBatch = items.length > 1;

  return (
    <div>

      <Dialog open={open} onOpenChange={setOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        {!trigger && !controlledOpen && (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PackagePlus size={16} className="mr-2" />
              {isBatch ? "Restock Selected" : "Restock"}
            </Button>
          </DialogTrigger>
        )}
        <DialogContent
          className={cn(
            "flex flex-col transition-all duration-300",
            isBatch ? "sm:max-w-2xl" : "sm:max-w-md",
          )}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center gap-2">
                <PackagePlus className="h-5 w-5 text-primary" />
                {isBatch ? "Batch Restock Items" : "Restock Product"}
              </DialogTitle>
              <DialogDescription>
                {isBatch
                  ? `Update quantities for ${items.length} selected items.`
                  : `Enter the quantity of "${items[0]?.name}" to add to stock.`}
              </DialogDescription>
            </DialogHeader>
            <div className="-mx-4 no-scrollbar max-h-[49vh] overflow-y-auto px-4">
              <div
                className={cn(
                  "grid gap-4 py-2 pr-4",
                  isBatch ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1",
                )}
              >
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 rounded-xl border bg-muted/30 shadow-sm flex flex-col gap-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="font-bold text-sm truncate block"
                        title={field.name}
                      >
                        {field.name}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Current Stock:{" "}
                        <span className="text-primary font-mono">
                          {field.currentQuantity}
                        </span>
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor={`add-quantity-${index}`}
                        className="text-[10px] uppercase font-bold text-muted-foreground"
                      >
                        Quantity to Add
                      </Label>
                      <div className="relative">
                        <Input
                          id={`add-quantity-${index}`}
                          {...control.register(`items.${index}.addQuantity`, {
                            valueAsNumber: true,
                          })}
                          type="number"
                          min="1"
                          className="h-9 font-bold bg-background pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-muted-foreground pointer-events-none">
                          Units
                        </span>
                      </div>
                      {errors.items?.[index]?.addQuantity && (
                        <p className="text-[10px] font-bold text-destructive uppercase tracking-tighter">
                          {errors.items[index]?.addQuantity?.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="">
              <Button
                disabled={isSubmitting}
                type="submit"
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2" />
                    Updating Inventory...
                  </>
                ) : isBatch ? (
                  "Complete Batch Restock"
                ) : (
                  "Confirm Restock"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
