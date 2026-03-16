"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { FieldGroup, Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { useSocket } from "./socket-provider";
import { ItemSchema, ItemInput } from "@/schemas/item";

export function CreateItem() {
  const { sendMessage } = useSocket();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemInput>({
    resolver: zodResolver(ItemSchema),
    defaultValues: {
      name: "",
      description: "",
      costPrice: 0,
      price: 0,
      quantity: 0,
      lowStockThreshold: 10,
      category: "",
    },
  });

  const onSubmit = async (data: ItemInput) => {
    try {
      const response = await fetch("/api/item/create-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create item.");
      }
      sendMessage({ type: "items:created" });
      reset();
      toast.success("Item created successfully!");
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Item name</FieldLabel>
              <Input
                id="name"
                {...register("name")}
                autoFocus
                type="text"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Input
                id="description"
                {...register("description")}
                type="text"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="costPrice">Cost Price</FieldLabel>
                <Input
                  id="costPrice"
                  {...register("costPrice", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                />
                {errors.costPrice && <p className="text-sm text-red-500">{errors.costPrice.message}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="price">Selling Price</FieldLabel>
                <Input
                  id="price"
                  {...register("price", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                <Input
                  id="quantity"
                  {...register("quantity", { valueAsNumber: true })}
                  type="number"
                />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="lowStockThreshold">Low Stock Alert</FieldLabel>
                <Input
                  id="lowStockThreshold"
                  {...register("lowStockThreshold", { valueAsNumber: true })}
                  type="number"
                />
                {errors.lowStockThreshold && <p className="text-sm text-red-500">{errors.lowStockThreshold.message}</p>}
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <Input
                id="category"
                {...register("category")}
                type="text"
              />
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </Field>
            <Field>
              <Button disabled={isSubmitting} type="submit" className="w-full">
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2" />
                    Creating...
                  </>
                ) : (
                  "Add Item"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
