"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Transaction } from "./types";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ReceiptText,
  User,
  ShoppingCart,
  Calendar,
  CreditCard,
} from "lucide-react";

interface TransactionReviewDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionReviewDialog({
  transaction,
  open,
  onOpenChange,
}: TransactionReviewDialogProps) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-primary/10 rounded-full">
              <ReceiptText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Transaction Review</DialogTitle>
              <DialogDescription className="font-mono text-xs uppercase">
                ID: {transaction.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <User className="h-3 w-3" />
                Customer Details
              </div>
              <p className="text-sm font-medium">
                {transaction.customerName || "General Walk-in"}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <User className="h-3 w-3" />
                Processed by
              </div>
              <p className="text-sm font-medium">{transaction.cashier.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Date & Time
              </div>
              <p className="text-sm font-medium">
                {format(new Date(transaction.createdAt), "PPP p")}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <CreditCard className="h-3 w-3" />
                Payment Method
              </div>
              <p className="text-sm font-medium">{transaction.paymentMethod || "CASH"}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <ShoppingCart className="h-3 w-3" />
            Order Summary
          </div>

          <div className="rounded-md border">
            <ScrollArea className="h-50">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0">
                  <TableRow>
                    <TableHead className="text-[10px] uppercase font-bold h-9">
                      Item
                    </TableHead>
                    <TableHead className="text-right text-[10px] uppercase font-bold h-9">
                      Qty
                    </TableHead>
                    <TableHead className="text-right text-[10px] uppercase font-bold h-9">
                      Price
                    </TableHead>
                    <TableHead className="text-right text-[10px] uppercase font-bold h-9">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="py-2">
                        <span className="text-sm font-medium">
                          {item.item.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-2 font-mono text-sm">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right py-2 font-mono text-sm">
                        ₱{item.unitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right py-2 font-mono font-bold text-sm">
                        ₱{item.subtotal.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <div className="flex flex-col sm:flex-row justify-between w-full">
            <div className="flex flex-col items-end sm:items-start text-right sm:text-left gap-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                Amount Paid: <span className="font-mono text-foreground">₱{Number(transaction.amountPaid || transaction.totalAmount).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                Change: <span className="font-mono text-emerald-600 font-bold">₱{Math.max(0, Number(transaction.amountPaid || 0) - Number(transaction.totalAmount)).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Grand Total
              </span>
              <span className="text-2xl font-mono font-bold text-primary">
                ₱{transaction.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
