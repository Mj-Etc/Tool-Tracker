"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { FieldGroup, Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { useSocket } from "./socket-provider";
import { ItemSchema, ItemInput } from "@/schemas/item";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useState, useEffect } from "react";
import { IconEdit } from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

interface EditItemDialogProps {
  item: {
    id: string;
    name: string;
    description: string;
    costPrice: number;
    price: number;
    quantity: number;
    lowStockThreshold: number;
    category: { id: string; name: string };
    subcategory: { id: string; name: string };
  };
  onSuccess?: () => void;
}

export function EditItemDialog({ item, onSuccess }: EditItemDialogProps) {
  const [open, setOpen] = useState(false);
  const { sendMessage } = useSocket();
  const { data: categories, isLoading: loadingCategories } = useSWR<Category[]>("/api/categories", fetcher);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ItemInput>({
    resolver: zodResolver(ItemSchema),
    defaultValues: {
      name: item.name,
      description: item.description,
      costPrice: Number(item.costPrice),
      price: Number(item.price),
      quantity: item.quantity,
      lowStockThreshold: item.lowStockThreshold,
      categoryId: item.category.id,
      subcategoryId: item.subcategory.id,
    },
  });

  const selectedCategoryId = watch("categoryId");
  const selectedSubcategoryId = watch("subcategoryId");
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    if (selectedCategoryId && categories) {
      const category = categories.find(c => c.id === selectedCategoryId);
      setAvailableSubcategories(category?.subcategories || []);
    } else {
      setAvailableSubcategories([]);
    }
  }, [selectedCategoryId, categories]);

  const onSubmit = async (data: ItemInput) => {
    try {
      const response = await fetch("/api/item/update-item", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: item.id }),
      });
      if (!response.ok) {
        throw new Error("Failed to update item.");
      }
      sendMessage({ type: "items:updated" });
      setOpen(false);
      onSuccess?.();
      toast.success("Item updated successfully!");
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <IconEdit size={16} className="mr-2" />
          Edit Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details for "{item.name}"
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-4">
            <Field>
              <FieldLabel htmlFor="edit-name">Item name</FieldLabel>
              <Input
                id="edit-name"
                {...register("name")}
                type="text"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-description">Description</FieldLabel>
              <Input
                id="edit-description"
                {...register("description")}
                type="text"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </Field>
            
            <Field>
              <FieldLabel htmlFor="edit-categoryId">Category</FieldLabel>
              <Select
                value={selectedCategoryId}
                onValueChange={(value) => {
                  setValue("categoryId", value);
                  setValue("subcategoryId", "");
                }}
                disabled={loadingCategories}
              >
                <SelectTrigger id="edit-categoryId" className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
            </Field>

            <Field>
              <FieldLabel htmlFor="edit-subcategoryId">Subcategory</FieldLabel>
              <Select
                value={selectedSubcategoryId}
                onValueChange={(value) => setValue("subcategoryId", value)}
                disabled={!selectedCategoryId || availableSubcategories.length === 0}
              >
                <SelectTrigger id="edit-subcategoryId" className="w-full">
                  <SelectValue placeholder="Select Subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Subcategories</SelectLabel>
                    {availableSubcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.subcategoryId && <p className="text-sm text-red-500">{errors.subcategoryId.message}</p>}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="edit-costPrice">Cost Price</FieldLabel>
                <Input
                  id="edit-costPrice"
                  {...register("costPrice", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                />
                {errors.costPrice && <p className="text-sm text-red-500">{errors.costPrice.message}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-price">Selling Price</FieldLabel>
                <Input
                  id="edit-price"
                  {...register("price", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="edit-quantity">Quantity</FieldLabel>
                <Input
                  id="edit-quantity"
                  {...register("quantity", { valueAsNumber: true })}
                  type="number"
                />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-lowStockThreshold">Low Stock Alert</FieldLabel>
                <Input
                  id="edit-lowStockThreshold"
                  {...register("lowStockThreshold", { valueAsNumber: true })}
                  type="number"
                />
                {errors.lowStockThreshold && <p className="text-sm text-red-500">{errors.lowStockThreshold.message}</p>}
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button disabled={isSubmitting} type="submit" className="w-full">
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Updating...
                </>
              ) : (
                "Update Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
