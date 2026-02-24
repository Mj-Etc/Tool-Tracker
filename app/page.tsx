import { SignInForm } from "@/components/signin-form";
import { ModeToggle } from "@/components/ui/mode-toggle"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background relative">
      <div className="absolute right-4 top-4">
        <ModeToggle />
      </div>
      <div className="w-full max-w-sm">
        <SignInForm />
      </div>
    </div>
  );
}
