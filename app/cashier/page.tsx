"use client";

import { SalesForm } from "@/components/sales/SalesForm";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SignOutButton } from "@/components/ui/signout-button";
import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { 
  IconLayoutDashboard, 
  IconHistory, 
  IconReceipt2,
  IconLogout
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/logo";

export default function CashierPage() {
  const { data: session, isPending } = useSession();

  if (isPending) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
      <Spinner className="h-10 w-10 text-primary" />
      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Initializing Terminal...</p>
    </div>
  );

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8 text-center border-dashed">
           <p className="text-muted-foreground font-medium mb-4">Terminal Session Required</p>
           <Button asChild className="w-full font-bold">
              <a href="/">Authenticate to Continue</a>
           </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
              <Logo className="h-7.5 w-7.5 text-primary" />
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                Cashier Terminal 
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Operator: {session.user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground">System Date</span>
              <span className="text-xs font-bold">{new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}</span>
            </div>
            <Separator orientation="vertical" className="h-8 hidden md:block" />
            <ModeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 flex flex-col items-center">
        <SalesForm />
      </main>

      <footer className="border-t py-4 bg-background">
        <div className="container mx-auto px-8 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <div>J&LL Hardware Store • ToolTrackR v1.2</div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Database Connected</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> WebSocket Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
