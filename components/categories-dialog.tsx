"use client";

import { useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { CategoryInput, CategorySchema } from "@/schemas/category";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "./ui/field";
import { Spinner } from "./ui/spinner";
import { toast } from "sonner";
import { IconPlus, IconTrash, IconCategory, IconChevronRight } from "@tabler/icons-react";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export function CategoriesDialog() {
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const { data: categories, mutate, isLoading } = useSWR<Category[]>("/api/categories", fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      subcategories: [{ name: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subcategories",
  });

  const onSubmit: SubmitHandler<CategoryInput> = async (data) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      toast.success("Category added successfully!");
      setAddOpen(false);
      reset();
      mutate();
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconCategory size={16} className="mr-2" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Categories & Subcategories</DialogTitle>
          <DialogDescription>
            View and manage how your items are organized.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center mb-0">
          <h3 className="text-sm font-medium">Existing Categories</h3>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8">
                <IconPlus size={14} className="mr-1" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new category and its subcategories.
                  </DialogDescription>
                </DialogHeader>
                <FieldGroup className="mt-4">
                  <Field data-invalid={!!errors.name}>
                    <FieldLabel htmlFor="cat-name">Category Name</FieldLabel>
                    <Input
                      id="cat-name"
                      placeholder="e.g. Electrical Supplies"
                      {...register("name")}
                    />
                    <FieldError errors={[errors.name]} />
                  </Field>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FieldLabel>Subcategories</FieldLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px]"
                        onClick={() => append({ name: "" })}
                      >
                        <IconPlus size={12} className="mr-1" />
                        Add Subcategory
                      </Button>
                    </div>
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-start">
                        <Field className="flex-1" data-invalid={!!errors.subcategories?.[index]?.name}>
                          <Input
                            placeholder={`Subcategory ${index + 1}`}
                            {...register(`subcategories.${index}.name` as const)}
                          />
                          <FieldError errors={[errors.subcategories?.[index]?.name]} />
                        </Field>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive"
                            onClick={() => remove(index)}
                          >
                            <IconTrash size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                    {errors.subcategories?.root && (
                      <p className="text-xs text-destructive">{errors.subcategories.root.message}</p>
                    )}
                  </div>
                </FieldGroup>
                <DialogFooter className="mt-6">
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        <Spinner className="mr-2 h-3 w-3" />
                        Saving...
                      </>
                    ) : (
                      "Save Category"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-75 pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
          ) : categories?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No categories found.
            </div>
          ) : (
            <div className="space-y-4">
              {categories?.map((category) => (
                <div key={category.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
                    <IconCategory size={16} className="text-primary" />
                    {category.name}
                    <Badge variant="secondary" className="ml-auto text-[10px]">
                      {category.subcategories.length} subs
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1 gap-x-4 pl-6 border-l ml-2">
                    {category.subcategories.map((sub) => (
                      <div key={sub.id} className="flex items-center text-xs text-muted-foreground">
                        <IconChevronRight size={12} className="mr-1 opacity-50" />
                        {sub.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
