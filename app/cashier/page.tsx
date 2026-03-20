"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { fetcher } from "@/lib/fetcher";
import { SalesForm } from "@/components/sales/SalesForm";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SignOutButton } from "@/components/ui/signout-button";
import { useSession } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { TransactionJournal } from "@/components/reports/transaction-journal";
import { DatePicker } from "@/components/ui/date-picker";
import { Transaction } from "@/components/reports/types";
import { ReceiptText, Calendar as CalendarIcon } from "lucide-react";

export default function CashierPage() {
  const { data: session, isPending } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const transUrl = `/api/transactions?startDate=${dateStr}&endDate=${dateStr}`;

  const {
    data: transactions,
    isLoading: transLoading,
  } = useSWR<Transaction[]>(transUrl, fetcher);

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
      
      <main className="container mx-auto py-6 flex flex-col items-center gap-8">
        <SalesForm />
        
        <div className="w-full max-w-7xl px-4 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ReceiptText className="h-4 w-4 shrink-0" />
                <span className="text-[10px] uppercase font-bold tracking-[0.2em]">
                  Terminal Records
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Journal Entry</h2>
              <p className="text-[10px] text-muted-foreground uppercase font-mono mt-1 tracking-tighter">
                {format(selectedDate, "EEEE, MMMM do yyyy")}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3" />
                Filter by Date
              </span>
              <DatePicker 
                date={selectedDate} 
                setDate={(d) => d && setSelectedDate(d)} 
              />
            </div>
          </div>

          <Separator />

          {transLoading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-card rounded-xl border border-dashed gap-4">
              <Spinner className="h-8 w-8 text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Transaction Ledger...</p>
            </div>
          ) : (
            <TransactionJournal 
              reportMode="daily" 
              selectedDate={selectedDate} 
              transactions={transactions || []} 
            />
          )}
        </div>
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
