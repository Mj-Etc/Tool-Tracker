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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Modular Components
import { ReportsHeader } from "@/components/reports/reports-header";
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
  StockLog,
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

  const logsUrl =
    reportMode === "overall"
      ? `/api/reports/stock-movement?overall=true`
      : `/api/reports/stock-movement?startDate=${format(startDate!, "yyyy-MM-dd")}&endDate=${format(endDate!, "yyyy-MM-dd")}`;

  const itemUrl =
    reportMode === "overall"
      ? `/api/item/list-items`
      : `/api/item/list-items?endDate=${format(endDate!, "yyyy-MM-dd")}`;

  const {
    data: transactions,
    isLoading: transLoading,
    isValidating: transValidating,
  } = useSWR<Transaction[]>(transUrl, fetcher);

  const { data: items, isLoading: itemsLoading } = useSWR<Item[]>(
    itemUrl,
    fetcher,
  );

  const {
    data: stats,
    isLoading: statsLoading,
    isValidating: statsValidating,
  } = useSWR<Stats>(statsUrl, fetcher);

  const {
    data: stockLogs,
    isLoading: logsLoading,
  } = useSWR<StockLog[]>(logsUrl, fetcher);

  const isDataLoading = transLoading || statsLoading || itemsLoading || logsLoading;
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
    <div className="flex flex-col gap-8 p-4 w-full min-h-screen">
      <ReportsHeader
        reportMode={reportMode}
        setReportMode={setReportMode}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        startDate={startDate}
        endDate={endDate}
        isToday={isToday}
        isRefreshing={isRefreshing}
        dateStr={dateStr}
      />

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
              <InventoryStats 
                items={items} 
                stats={stats} 
                stockLogs={stockLogs} 
                reportMode={reportMode}
                endDate={endDate}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
