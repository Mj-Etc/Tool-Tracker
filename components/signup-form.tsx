"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SignUpSchema } from "@/schemas/auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "./ui/field";
import { Spinner } from "./ui/spinner";
import Marquee from "react-fast-marquee";

type SignupValues = z.infer<typeof SignUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<SignupValues> = async (data) => {
    try {
      const response = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (response.error) {
        toast.error(response.error.message || "Signup failed.", {
          duration: 2000,
        });
      } else {
        router.push("/");
        toast.success("Account created!", {
          position: "top-center",
          duration: 2000,
        });
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="gap-6">
              <div className="relative">
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">
                    {errors.name ? (
                      <span className="text-destructive">
                        {errors.name.message}
                      </span>
                    ) : (
                      "Name"
                    )}
                  </FieldLabel>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    {...register("name")}
                    aria-invalid={errors.name ? "true" : "false"}
                  />
                </Field>
              </div>
              <div className="relative">
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
                    placeholder="name@example.com"
                    {...register("email")}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                </Field>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <Field data-invalid={!!errors.password}>
                    <FieldLabel htmlFor="password">
                      {errors.password ? (
                        <Marquee>
                          <span className="text-destructive pr-4">
                            {errors.password.message}
                          </span>
                        </Marquee>
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
                        className="pr-9"
                      />
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </Field>
                </div>
                <div className="relative">
                  <Field data-invalid={!!errors.confirmPassword}>
                    <FieldLabel htmlFor="confirmPassword">
                      {errors.confirmPassword ? (
                        <Marquee>
                          <span className="text-destructive pr-4">
                            {errors.confirmPassword.message}
                          </span>
                        </Marquee>
                      ) : (
                        "Confirm Password"
                      )}
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        {...register("confirmPassword")}
                        aria-invalid={errors.confirmPassword ? "true" : "false"}
                        className="pr-9"
                      />
                      <Button
                        type="button"
                        variant="link"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-0 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </Button>
                    </div>
                  </Field>
                </div>
              </div>
              <Field className="mt-1">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner />
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
                <FieldDescription className="text-center text-sm text-muted-foreground mt-4">
                  Already have an account?{" "}
                  <Link
                    href="/"
                    className="text-primary underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
