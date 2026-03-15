import { z } from "zod";

export const ItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be at least 0"),
  quantity: z.number().int().min(0, "Quantity must be at least 0"),
  lowStockThreshold: z.number().int().min(0, "Threshold must be at least 0"),
  category: z.string().optional(),
});

export type ItemInput = z.infer<typeof ItemSchema>;
