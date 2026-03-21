"use client";

import { useState } from "react";
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
import { ItemSchema, ItemInput } from "@/schemas/item";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useEffect } from "react";
import { IconPlus } from "@tabler/icons-react";
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

export function AddItemDialog() {
  const [open, setOpen] = useState(false);
  const { data: categories, isLoading: loadingCategories } = useSWR<Category[]>("/api/categories", fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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
      categoryId: "",
      subcategoryId: "",
    },
  });

  const selectedCategoryId = watch("categoryId");
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
      const response = await fetch("/api/item/create-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create item.");
      }
      reset();
      setOpen(false);
      toast.success("Item created successfully!");
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconPlus size={16} className="mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new item in the inventory.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="new-name">Item name</FieldLabel>
                <Input
                  id="new-name"
                  {...register("name")}
                  autoFocus
                  type="text"
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="new-description">Description</FieldLabel>
                <Input
                  id="new-description"
                  {...register("description")}
                  type="text"
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
              </Field>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="new-categoryId">Category</FieldLabel>
                <Select
                  value={selectedCategoryId}
                  onValueChange={(value) => {
                    setValue("categoryId", value);
                    setValue("subcategoryId", "");
                  }}
                  disabled={loadingCategories}
                >
                  <SelectTrigger id="new-categoryId" className="w-full">
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
                <FieldLabel htmlFor="new-subcategoryId">Subcategory</FieldLabel>
                <Select
                  value={watch("subcategoryId")}
                  onValueChange={(value) => setValue("subcategoryId", value)}
                  disabled={!selectedCategoryId || availableSubcategories.length === 0}
                >
                  <SelectTrigger id="new-subcategoryId" className="w-full">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="new-costPrice">Cost Price</FieldLabel>
                <Input
                  id="new-costPrice"
                  {...register("costPrice", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                />
                {errors.costPrice && <p className="text-sm text-red-500">{errors.costPrice.message}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="new-price">Selling Price</FieldLabel>
                <Input
                  id="new-price"
                  {...register("price", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                />
                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="new-quantity">Quantity</FieldLabel>
                <Input
                  id="new-quantity"
                  {...register("quantity", { valueAsNumber: true })}
                  type="number"
                />
                {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
              </Field>
              <Field>
                <FieldLabel htmlFor="new-lowStockThreshold">Low Stock Alert</FieldLabel>
                <Input
                  id="new-lowStockThreshold"
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
                  Creating...
                </>
              ) : (
                "Add Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
