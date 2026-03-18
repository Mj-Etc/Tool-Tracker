"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Package } from "lucide-react";
import { Item, Stats, StockLog } from "./types";
import { StockMovementTable } from "./stock-movement-table";

import { format } from "date-fns";
import { ReportMode } from "./types";

interface InventoryStatsProps {
  items?: Item[];
  stats?: Stats;
  stockLogs?: StockLog[];
  reportMode?: ReportMode;
  endDate?: Date;
}

export function InventoryStats({ items, stats, stockLogs, reportMode, endDate }: InventoryStatsProps) {
  const lowStockItems = items?.filter(i => i.quantity <= (i.lowStockThreshold ?? 0)) || [];
  const isHistorical = reportMode !== "overall";
  const dateLabel = endDate ? format(endDate, "MMMM d, yyyy") : "";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card className="shadow-sm border-rose-200 dark:border-rose-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              Stock Alerts
            </CardTitle>
            <CardDescription>
              {isHistorical 
                ? `Items that were below threshold as of ${dateLabel}` 
                : "Items requiring immediate reorder"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="*:data-radix-scroll-area-viewport:max-h-83.5 pr-4">
              <div className="space-y-2">
                {lowStockItems.map(i => (
                  <div key={i.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="font-semibold text-sm">{i.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        {typeof i.category === "string" 
                          ? i.category 
                          : (i.category?.name || "General")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-600">{i.quantity} LEFT</p>
                      <p className="text-[10px] text-muted-foreground">THRESHOLD: {i.lowStockThreshold}</p>
                    </div>
                  </div>
                ))}
                {lowStockItems.length === 0 && (
                  <div className="h-25 flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg">
                    All stock levels within safe limits
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Asset Valuation
            </CardTitle>
            <CardDescription>
              {isHistorical 
                ? `Historical valuation as of ${dateLabel}` 
                : "Current market and cost value of inventory"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 rounded-lg border bg-background space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Retail Liquidity</p>
              <p className="text-4xl font-bold tracking-tighter">₱{(stats?.totalInventoryValue ?? 0).toLocaleString()}</p>
            </div>
            <Separator />
            <div className="p-6 rounded-lg border bg-muted/30 space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Inventory Cost</p>
              <p className="text-3xl font-bold tracking-tighter">₱{(stats?.totalInventoryCost ?? 0).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Aging Stock</p>
                <p className="text-xl font-bold">{stats?.agingStock || 0} items</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Inventory Turn</p>
                <p className="text-xl font-bold">4.2x</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <StockMovementTable logs={stockLogs} />
    </div>
  );
}
