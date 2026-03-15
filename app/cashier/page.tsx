"use client";

import { SalesForm } from "@/components/sales/SalesForm";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SignOutButton } from "@/components/ui/signout-button";
import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

export default function CashierPage() {
  const { data: session, isPending } = useSession();

  if (isPending) return (
    <div className="h-screen flex items-center justify-center">
      <Spinner />
      <p className="ml-2">Loading session...</p>
    </div>
  );

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Please sign in to access the cashier portal.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Cashier Portal</h1>
          <p className="text-muted-foreground">Welcome, {session.user.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <SignOutButton />
        </div>
      </header>
      
      <main className="flex justify-center">
        <SalesForm />
      </main>
    </div>
  );
}
