import { z } from "zod";

export const SignInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const PersonnelSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["admin", "cashier"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
