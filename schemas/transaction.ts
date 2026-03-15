import { z } from "zod";

export const TransactionItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0),
  subtotal: z.number().min(0),
});

export const TransactionSchema = z.object({
  customerName: z.string().optional(),
  items: z.array(TransactionItemSchema).min(1, "At least one item is required"),
  totalAmount: z.number().min(0),
});

export type TransactionInput = z.infer<typeof TransactionSchema>;
export type TransactionItemInput = z.infer<typeof TransactionItemSchema>;
