"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  Package,
  PackagePlus,
  PlusCircleIcon,
} from "lucide-react";
import { Item, Stats, StockLog } from "./types";
import { StockMovementTable } from "./stock-movement-table";
import { RestockItemDialog } from "../items/restock-item-dialog";
import { Button } from "../ui/button";

import { format, isSameDay } from "date-fns";
import { ReportMode } from "./types";

interface InventoryStatsProps {
  items?: Item[];
  stats?: Stats;
  stockLogs?: StockLog[];
  reportMode?: ReportMode;
  endDate?: Date;
  selectedDate: Date;
}

export function InventoryStats({
  items,
  stats,
  stockLogs,
  reportMode,
  endDate,
  selectedDate,
}: InventoryStatsProps) {
  const lowStockItems =
    items?.filter((i) => i.quantity <= (i.lowStockThreshold ?? 0)) || [];
  const isHistorical = reportMode !== "overall";
  const dateLabel = endDate ? format(endDate, "MMMM d, yyyy") : "";

  const isToday =
    reportMode === "daily" && endDate && isSameDay(endDate, new Date());
  const canRestock = reportMode === "overall" || isToday;

  return (
    <div className="grid grid-cols-2 grid-rows-[auto_auto] gap-4">
      <div className="grid grid-cols-1 grid-rows-[auto_auto] gap-4">
        {canRestock && (
          <Card className="shadow-sm">
            <CardContent>
              <CardHeader className="px-0">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <CardTitle>Operational Mode Active</CardTitle>
                </div>
                <CardDescription>
                  You are in{" "}
                  <strong>
                    {reportMode === "overall" ? "Overall" : "Today's"}
                  </strong>{" "}
                  mode. Restock buttons are available to manage your live
                  inventory directly from this report.
                </CardDescription>
              </CardHeader>
            </CardContent>
          </Card>
        )}
        {!canRestock && (
          <Card className="shadow-sm">
            <CardContent>
              <CardHeader className="px-0">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <CardTitle>Historical Snapshot View</CardTitle>
                </div>
                <CardDescription>
                  Viewing past data. To restock items, switch to{" "}
                  <strong>Overall</strong> or <strong>Today's</strong> report to
                  access live inventory operations.
                </CardDescription>
              </CardHeader>
            </CardContent>
          </Card>
        )}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-end justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Stock Alerts
              </CardTitle>
              <CardDescription>
                {isHistorical
                  ? `Items that were below threshold as of ${dateLabel}`
                  : "Items requiring immediate reorder"}
              </CardDescription>
            </div>
            {canRestock && lowStockItems.length > 0 && (
              <RestockItemDialog
                items={lowStockItems as any}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex gap-2 transition-all active:scale-95"
                  >
                    Restock All
                  </Button>
                }
              />
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="*:data-radix-scroll-area-viewport:max-h-54.5 pr-4">
              <div className="space-y-4">
                {lowStockItems.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm">{i.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        {typeof i.category === "string"
                          ? i.category
                          : i.category?.name || "General"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-2">
                        <p className="text-sm font-bold text-destructive">
                          {i.quantity} LEFT
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          THRESHOLD: {i.lowStockThreshold}
                        </p>
                      </div>
                      {canRestock && (
                        <RestockItemDialog
                          items={[i] as any}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex gap-2 transition-all active:scale-95"
                            >
                              <PlusCircleIcon className="h-4 w-4" />
                            </Button>
                          }
                        />
                      )}
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
      </div>
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
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Retail Liquidity
            </p>
            <p className="text-4xl font-bold tracking-tighter">
              ₱{(stats?.totalInventoryValue ?? 0).toLocaleString()}
            </p>
          </div>
          <Separator />
          <div className="p-6 rounded-lg border bg-muted/30 space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Inventory Cost
            </p>
            <p className="text-3xl font-bold tracking-tighter">
              ₱{(stats?.totalInventoryCost ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="pt-2">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                Aging Stock
              </p>
              <p className="text-xl font-bold">
                {stats?.agingStock || 0} items
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="col-span-2">
        <StockMovementTable logs={stockLogs} reportMode={reportMode} selectedDate={selectedDate} />
      </div>
    </div>
  );
}
