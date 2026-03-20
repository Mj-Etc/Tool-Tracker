"use client";

import { useState } from "react";
import useSWR from "swr";
import { format } from "date-fns";
import { fetcher } from "@/lib/fetcher";
import { SalesForm } from "@/components/sales/SalesForm";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { SignOutButton } from "@/components/ui/signout-button";
import { useSession } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/logo";
import { TransactionJournal } from "@/components/reports/transaction-journal";
import { DatePicker } from "@/components/ui/date-picker";
import { Transaction } from "@/components/reports/types";
import { ReceiptText, Calendar as CalendarIcon } from "lucide-react";
import { CashierSkeleton } from "@/components/sales/cashier-skeleton";
import { ItemWithUser } from "@/components/items/types";

export default function CashierPage() {
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const transUrl = `/api/transactions?startDate=${dateStr}&endDate=${dateStr}`;

  const {
    data: transactions,
    isLoading: transLoading,
  } = useSWR<Transaction[]>(transUrl, fetcher);

  const { 
    data: items, 
    isLoading: itemsLoading 
  } = useSWR<ItemWithUser[]>("/api/item/list-items", fetcher);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background animate-in fade-in duration-500">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
              <Logo className="h-7.5 w-7.5 text-primary" />
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                Cashier Terminal 
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Operator: {session?.user.name}</p>
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
        {itemsLoading ? (
          <CashierSkeleton />
        ) : (
          <>
            <SalesForm items={items || []} />
            
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
                <div className="rounded-md border p-4 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                     <div className="h-10 w-64 bg-muted animate-pulse rounded-md" />
                     <div className="flex gap-2">
                        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
                        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
                     </div>
                  </div>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                           <div className="space-y-1">
                              <div className="h-4 w-40 bg-muted animate-pulse rounded-md" />
                              <div className="h-3 w-24 bg-muted animate-pulse rounded-md" />
                           </div>
                        </div>
                        <div className="h-4 w-20 bg-muted animate-pulse rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <TransactionJournal 
                  reportMode="daily" 
                  selectedDate={selectedDate} 
                  transactions={transactions || []} 
                />
              )}
            </div>
          </>
        )}
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
