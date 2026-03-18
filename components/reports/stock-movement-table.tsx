"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { StockLog } from "./types";
import { History, ArrowUpRight, ArrowDownRight, User, Package } from "lucide-react";

interface StockMovementTableProps {
  logs?: StockLog[];
}

export function StockMovementTable({ logs }: StockMovementTableProps) {
  const getReasonBadge = (reason: StockLog["reason"]) => {
    switch (reason) {
      case "SALE":
        return <Badge variant="success">SALE</Badge>;
      case "RESTOCK":
        return <Badge variant="destructive">RESTOCK</Badge>;
      case "CREATION":
        return <Badge variant="info">INITIAL</Badge>;
      case "MANUAL_ADJUSTMENT":
        return <Badge variant="warning">ADJUST</Badge>;
      default:
        return <Badge variant="outline">{reason}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <History className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Inventory Journal</h3>
      </div>
      
      <div className="rounded-md border bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-[10px] uppercase font-bold tracking-wider">Timestamp</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-wider">Product Node</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-wider">Action</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-wider">Executor</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-wider text-right">Delta</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-wider text-right">New Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs?.map((log) => (
              <TableRow key={log.id} className="hover:bg-muted/5 transition-colors">
                <TableCell className="font-mono text-[10px] text-muted-foreground">
                  {format(new Date(log.createdAt), "HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Package className="h-3 w-3 text-muted-foreground" />
                    <span className="font-bold text-sm tracking-tight">{log.item.name}</span>
                  </div>
                </TableCell>
                <TableCell>{getReasonBadge(log.reason)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium">{log.user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className={`flex items-center justify-end gap-1 font-mono font-bold ${log.change > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {log.change > 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {log.change > 0 ? `+${log.change}` : log.change}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-sm">
                  {log.newStock}
                </TableCell>
              </TableRow>
            ))}
            {logs?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                  No stock movements detected in this period.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
