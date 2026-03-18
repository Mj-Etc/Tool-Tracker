"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Transaction, ReportMode } from "./types";

interface TransactionJournalProps {
  reportMode: ReportMode;
  selectedDate: Date;
  transactions?: Transaction[];
}

export function TransactionJournal({ reportMode, selectedDate, transactions }: TransactionJournalProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Journal Entry</CardTitle>
        <CardDescription>
          {reportMode === "daily" ? `Transactions for ${format(selectedDate, "PPP")}` : "Transaction ledger"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-30">Date/Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Cashier</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">
                  {reportMode === "daily" ? format(new Date(t.createdAt), "HH:mm") : format(new Date(t.createdAt), "MMM d, HH:mm")}
                </TableCell>
                <TableCell className="font-medium">{t.customerName || "General Walk-in"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{t.cashier.name}</TableCell>
                <TableCell className="text-right">{t.items.length}</TableCell>
                <TableCell className="text-right font-bold">₱{Number(t.totalAmount).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            {transactions?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                  No transactions found for this period
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
