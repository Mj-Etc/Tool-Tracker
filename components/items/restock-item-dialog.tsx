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
import { useSocket } from "../socket-provider";
import { useState, useEffect } from "react";
import { PackagePlus } from "lucide-react";
import { z } from "zod";
import { ItemWithUser } from "./types";
import { ScrollArea } from "../ui/scroll-area";

const RestockSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    currentQuantity: z.number(),
    addQuantity: z.number().min(1, "Quantity must be at least 1"),
  })),
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
  
  const { sendMessage } = useSocket();

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
        items: data.items.map(i => ({ id: i.id, quantity: i.addQuantity }))
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

      sendMessage({ type: "items:updated" });
      setOpen(false);
      onSuccess?.();
      toast.success(items.length > 1 ? "Items restocked successfully!" : `Restocked ${items[0].name} successfully!`);
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    }
  };

  const isBatch = items.length > 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && !controlledOpen && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <PackagePlus size={16} className="mr-2" />
            {isBatch ? "Restock Selected" : "Restock"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <DialogHeader>
            <DialogTitle>{isBatch ? "Batch Restock Items" : "Restock Product"}</DialogTitle>
            <DialogDescription>
              {isBatch 
                ? `Update quantities for ${items.length} selected items.` 
                : `Enter the quantity of "${items[0]?.name}" to add to stock.`}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 mt-4 pr-4">
            <FieldGroup className="py-2">
              {fields.map((field, index) => (
                <div key={field.id} className="pb-4 mb-4 border-b last:border-0 last:mb-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm truncate max-w-[200px]" title={field.name}>
                      {field.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Current: {field.currentQuantity}
                    </span>
                  </div>
                  <Field>
                    <FieldLabel htmlFor={`add-quantity-${index}`}>Quantity to Add</FieldLabel>
                    <Input
                      id={`add-quantity-${index}`}
                      {...control.register(`items.${index}.addQuantity`, { valueAsNumber: true })}
                      type="number"
                      min="1"
                    />
                    {errors.items?.[index]?.addQuantity && (
                      <p className="text-sm text-red-500">{errors.items[index]?.addQuantity?.message}</p>
                    )}
                  </Field>
                </div>
              ))}
            </FieldGroup>
          </ScrollArea>

          <DialogFooter className="mt-6">
            <Button disabled={isSubmitting} type="submit" className="w-full">
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Restocking...
                </>
              ) : (
                isBatch ? "Restock All Items" : "Restock Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
