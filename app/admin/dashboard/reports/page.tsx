"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import {
  format,
  isSameDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { fetcher } from "@/lib/fetcher";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, Globe } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Modular Components
import { ReportSkeleton } from "@/components/reports/report-skeleton";
import { KpiCards } from "@/components/reports/kpi-cards";
import { RevenueTrendChart } from "@/components/reports/revenue-trend-chart";
import { FinancialSummary } from "@/components/reports/financial-summary";
import { TopProducts } from "@/components/reports/top-products";
import { TransactionJournal } from "@/components/reports/transaction-journal";
import { InventoryStats } from "@/components/reports/inventory-stats";
import {
  Transaction,
  Item,
  Stats,
  ReportMode,
} from "@/components/reports/types";

export default function ReportsPage() {
  const [reportMode, setReportMode] = useState<ReportMode>("daily");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const isToday = isSameDay(selectedDate, new Date());

  const { startDate, endDate } = useMemo(() => {
    if (reportMode === "daily")
      return { startDate: selectedDate, endDate: selectedDate };
    if (reportMode === "weekly")
      return {
        startDate: startOfWeek(selectedDate),
        endDate: endOfWeek(selectedDate),
      };
    if (reportMode === "monthly")
      return {
        startDate: startOfMonth(selectedDate),
        endDate: endOfMonth(selectedDate),
      };
    return { startDate: undefined, endDate: undefined };
  }, [reportMode, selectedDate]);

  const statsUrl =
    reportMode === "overall"
      ? `/api/stats?overall=true`
      : `/api/stats?startDate=${format(startDate!, "yyyy-MM-dd")}&endDate=${format(endDate!, "yyyy-MM-dd")}`;

  const transUrl =
    reportMode === "overall"
      ? `/api/transactions?overall=true`
      : `/api/transactions?startDate=${format(startDate!, "yyyy-MM-dd")}&endDate=${format(endDate!, "yyyy-MM-dd")}`;

  const {
    data: transactions,
    isLoading: transLoading,
    isValidating: transValidating,
  } = useSWR<Transaction[]>(transUrl, fetcher);
  const { data: items, isLoading: itemsLoading } = useSWR<Item[]>(
    "/api/item/list-items",
    fetcher,
  );
  const {
    data: stats,
    isLoading: statsLoading,
    isValidating: statsValidating,
  } = useSWR<Stats>(statsUrl, fetcher);

  const isDataLoading = transLoading || statsLoading || itemsLoading;
  const isRefreshing = (transValidating || statsValidating) && !isDataLoading;

  // Business Logic Calculations
  const revenue = useMemo(
    () => transactions?.reduce((sum, t) => sum + Number(t.totalAmount), 0) || 0,
    [transactions],
  );

  const { cost, profit, margin } = useMemo(() => {
    let cost = 0;
    transactions?.forEach((t) =>
      t.items.forEach((i) => {
        cost += Number(i.item.costPrice) * i.quantity;
      }),
    );
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { cost, profit, margin };
  }, [transactions, revenue]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { revenue: number; itemsSold: number }> = {};
    transactions?.forEach((t) =>
      t.items.forEach((i) => {
        const cat = i.item.name.split(" ")[0] || "General";
        if (!stats[cat]) stats[cat] = { revenue: 0, itemsSold: 0 };
        stats[cat].revenue += Number(i.subtotal);
        stats[cat].itemsSold += i.quantity;
      }),
    );
    return stats;
  }, [transactions]);

  const chartData = useMemo(() => {
    if (!transactions || reportMode === "overall" || reportMode === "daily")
      return [];
    const days = eachDayOfInterval({ start: startDate!, end: endDate! });
    return days.map((day) => ({
      date: format(day, "MMM dd"),
      revenue: transactions
        .filter((t) => isSameDay(new Date(t.createdAt), day))
        .reduce((sum, t) => sum + Number(t.totalAmount), 0),
    }));
  }, [transactions, reportMode, startDate, endDate]);

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 transition-[height] duration-300 ease-in-out">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider truncate">
              Analytics Terminal
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight transition-all duration-300">
            {reportMode === "overall"
              ? "Lifetime Performance"
              : reportMode === "weekly"
                ? "Weekly Performance"
                : reportMode === "monthly"
                  ? "Monthly Performance"
                  : isToday
                    ? "Today's Performance"
                    : "Daily Report"}
          </h1>
          <p className="text-muted-foreground transition-all duration-300">
            {reportMode === "overall"
              ? "All-time aggregated business metrics"
              : reportMode === "weekly"
                ? `${format(startDate!, "MMM d")} - ${format(endDate!, "MMM d, yyyy")}`
                : reportMode === "monthly"
                  ? format(selectedDate, "MMMM yyyy")
                  : format(selectedDate, "EEEE, MMMM do yyyy")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <ToggleGroup
            type="single"
            value={reportMode}
            onValueChange={(v) => v && setReportMode(v as any)}
            className="border p-1 bg-muted/50 rounded-lg"
          >
            <ToggleGroupItem
              value="daily"
              className="px-4 text-xs font-bold uppercase tracking-wider data-[state=on]:bg-background"
            >
              Daily
            </ToggleGroupItem>
            <ToggleGroupItem
              value="weekly"
              className="px-4 text-xs font-bold uppercase tracking-wider data-[state=on]:bg-background"
            >
              Weekly
            </ToggleGroupItem>
            <ToggleGroupItem
              value="monthly"
              className="px-4 text-xs font-bold uppercase tracking-wider data-[state=on]:bg-background"
            >
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem
              value="overall"
              className="px-4 text-xs font-bold uppercase tracking-wider data-[state=on]:bg-background"
            >
              Overall
            </ToggleGroupItem>
          </ToggleGroup>

          <Separator
            orientation="vertical"
            className="h-10 mx-1 hidden sm:block"
          />

          <div className="flex items-center gap-2 min-w-50 justify-end relative">
            <div className="w-5 h-5 flex items-center justify-center">
              {isRefreshing && (
                <Spinner className="h-4 w-4 text-muted-foreground animate-spin" />
              )}
            </div>
            <div className="w-full">
              {reportMode === "overall" ? (
                <Badge
                  variant="outline"
                  className="h-10 w-full px-4 rounded-md border text-xs font-mono gap-2 justify-center"
                >
                  <Globe className="h-3 w-3" /> ALL_TIME_ACTIVE
                </Badge>
              ) : (
                <DatePicker
                  date={selectedDate}
                  setDate={(d) => d && setSelectedDate(d)}
                />
              )}
            </div>
          </div>
          <Badge
            variant="secondary"
            className="h-10 px-4 rounded-md border text-xs font-mono shrink-0"
          >
            SYS_REF:{" "}
            {reportMode === "overall"
              ? "00000000"
              : reportMode === "weekly"
                ? `W${format(selectedDate, "ww")}${format(selectedDate, "yyyy")}`
                : reportMode === "monthly"
                  ? `M${format(selectedDate, "MM")}${format(selectedDate, "yyyy")}`
                  : dateStr.replace(/-/g, "")}
          </Badge>
        </div>
      </div>

      <Separator />

      {isDataLoading ? (
        <ReportSkeleton />
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <KpiCards
            revenue={revenue}
            stats={stats}
            reportMode={reportMode}
            margin={margin}
          />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-background border h-12 p-1 gap-1">
              <TabsTrigger
                value="overview"
                className="px-6 data-[state=active]:bg-muted"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="px-6 data-[state=active]:bg-muted"
              >
                Journal
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="px-6 data-[state=active]:bg-muted"
              >
                Inventory
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 outline-none">
              <RevenueTrendChart
                reportMode={reportMode}
                chartData={chartData}
              />
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-start">
                <FinancialSummary
                  reportMode={reportMode}
                  revenue={revenue}
                  cost={cost}
                  profit={profit}
                  margin={margin}
                  categoryStats={categoryStats}
                />
                <TopProducts reportMode={reportMode} stats={stats} />
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="outline-none">
              <TransactionJournal
                reportMode={reportMode}
                selectedDate={selectedDate}
                transactions={transactions}
              />
            </TabsContent>

            <TabsContent value="inventory" className="outline-none">
              <InventoryStats items={items} stats={stats} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
