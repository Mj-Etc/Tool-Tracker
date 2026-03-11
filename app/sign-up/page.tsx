import { SignUpForm } from "@/components/signup-form";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default async function SignUpPage() {

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background relative">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
