"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { signIn } from "@/lib/auth-client";
import { SignInSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";
import { Logo } from "./logo";
import { DialogFooter } from "./ui/dialog";

type SignInValues = z.infer<typeof SignInSchema>;

export function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<SignInValues> = async (data) => {
    try {
      const response = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (response.error) {
        toast.error(response.error.message || "Something went wrong.");
      } else {
        router.refresh();
        toast.success("Signed-in successfully.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col justify-center items-center">
          <Logo className="text-primary h-20 w-20" />
          <CardTitle className="text-lg font-bold">Tool Tracker</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">
                  {errors.email ? (
                    <span className="text-destructive">
                      {errors.email.message}
                    </span>
                  ) : (
                    "Email"
                  )}
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">
                  {errors.password ? (
                    <span className="text-destructive">
                      {errors.password.message}
                    </span>
                  ) : (
                    "Password"
                  )}
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <Button
                    className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    size="icon"
                    type="button"
                    variant="link"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </Field>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
