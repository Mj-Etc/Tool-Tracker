"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PersonnelSchema } from "@/schemas/auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Spinner } from "./ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { authClient } from "@/lib/auth-client";
import { IconPlus } from "@tabler/icons-react";
import { mutate } from "swr";

const Personnel = PersonnelSchema;

type PersonnelValues = z.infer<typeof PersonnelSchema>;

export function AddPersonnelDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonnelValues>({
    resolver: zodResolver(Personnel),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      role: "cashier",
    },
    mode: "onChange",
  });

  const selectedRole = watch("role");

  const onSubmit: SubmitHandler<PersonnelValues> = async (data) => {
    try {
      const { data: newUser, error } = await authClient.admin.createUser({
        email: data.email,
        password: data.password,
        name: data.name,
        data: {
          role: data.role,
        },
      });

      if (error) {
        toast.error(error.message || "Failed to create user");
        return;
      }

      mutate("/api/users");
      toast.success(`${data.name} added as ${data.role}!`);
      setOpen(false);
      reset();
    } catch (err) {
      toast.error("An unexpected error occurred.");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconPlus size={16} />
          Add Personnel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Register Personnel</DialogTitle>
            <DialogDescription>
              Create a new secure access node for system operation
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" placeholder="John Doe" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                {...register("email")}
              />
              <FieldError
                errors={[errors.email]}
                className="text-[10px] font-bold"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="role">Access Level</FieldLabel>
              <Select
                value={selectedRole}
                onValueChange={(value) =>
                  setValue("role", value as "admin" | "cashier")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Secure Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="link"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full text-muted-foreground hover:bg-transparent"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              <FieldError
                errors={[errors.password]}
                className="text-[10px] font-bold"
              />
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirm</FieldLabel>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                />
                <Button
                  type="button"
                  variant="link"
                  size="icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-0 h-full text-muted-foreground hover:bg-transparent"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </Button>
              </div>
              <FieldError
                errors={[errors.confirmPassword]}
                className="text-[10px] font-bold"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-3 w-3" />
                  Initializing...
                </>
              ) : (
                "Create Node"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
