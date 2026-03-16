import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  subcategories: z.array(z.object({
    name: z.string().min(1, "Subcategory name is required")
  })).min(1, "At least one subcategory is required")
});

export type CategoryInput = z.infer<typeof CategorySchema>;
