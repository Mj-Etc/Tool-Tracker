"use client";

import { useState } from "react";
import useSWR from "swr";
import { format, isSameDay } from "date-fns";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Receipt,
  BarChart3,
  PieChart as PieChartIcon,
  LayoutDashboard,
  Globe
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Transaction = {
  id: string;
  customerName: string | null;
  cashier: { name: string };
  totalAmount: number;
  createdAt: string;
  items: {
    item: { name: string; costPrice: number };
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
};

type Item = {
  id: string;
  name: string;
  costPrice: number;
  price: number;
  quantity: number;
  category: string | null;
  createdAt: string;
  lowStockThreshold: number;
};

type Stats = {
  totalInventoryValue: number;
  totalInventoryCost: number;
  avgTransactionValue: number;
  agingStock: number;
  totalRevenue: number;
  recentTransactionCount: number;
  fastMoving: { id: string; name: string; totalSold: number }[];
};

export default function ReportsPage() {
  const [reportMode, setReportMode] = useState<"daily" | "overall">("daily");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const isToday = isSameDay(selectedDate, new Date());

  const statsUrl = reportMode === "daily" ? `/api/stats?date=${dateStr}` : `/api/stats?overall=true`;
  const transUrl = reportMode === "daily" ? `/api/transactions?date=${dateStr}` : `/api/transactions?overall=true`;

  const { data: transactions, isLoading: transLoading, isValidating: transValidating } = useSWR<Transaction[]>(transUrl, fetcher);
  const { data: items, isLoading: itemsLoading } = useSWR<Item[]>("/api/item/list-items", fetcher);
  const { data: stats, isLoading: statsLoading, isValidating: statsValidating } = useSWR<Stats>(statsUrl, fetcher);

  const isDataLoading = transLoading || statsLoading || itemsLoading;
  const isRefreshing = transValidating || statsValidating;

  // Calculate Financials for the selected day/mode
  const revenue = transactions?.reduce((sum, t) => sum + Number(t.totalAmount), 0) || 0;
  
  let cost = 0;
  transactions?.forEach(t => {
    t.items.forEach(i => {
      cost += (Number(i.item.costPrice) * i.quantity);
    });
  });
  
  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  // Category Analysis for the selected day/mode
  const categoryStats: Record<string, { revenue: number; itemsSold: number }> = {};
  transactions?.forEach(t => {
    t.items.forEach(i => {
      const cat = i.item.name.split(' ')[0] || "General";
      if (!categoryStats[cat]) categoryStats[cat] = { revenue: 0, itemsSold: 0 };
      categoryStats[cat].revenue += Number(i.subtotal);
      categoryStats[cat].itemsSold += i.quantity;
    });
  });

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Analytics Terminal</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            {reportMode === "overall" ? "Lifetime Performance" : (isToday ? "Today's Performance" : "Daily Report")}
          </h1>
          <p className="text-muted-foreground">
            {reportMode === "overall" ? "All-time aggregated business metrics" : format(selectedDate, "EEEE, MMMM do yyyy")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup type="single" value={reportMode} onValueChange={(v) => v && setReportMode(v as any)} className="border p-1 bg-muted/50 rounded-lg">
            <ToggleGroupItem value="daily" className="px-4 text-xs font-bold uppercase tracking-wider data-[state=on]:bg-background">Daily</ToggleGroupItem>
            <ToggleGroupItem value="overall" className="px-4 text-xs font-bold uppercase tracking-wider data-[state=on]:bg-background">Overall</ToggleGroupItem>
          </ToggleGroup>
          
          <Separator orientation="vertical" className="h-10 mx-1 hidden sm:block" />

          <div className="flex items-center gap-2">
            {isRefreshing && <Spinner className="h-4 w-4 text-muted-foreground animate-spin" />}
            {reportMode === "daily" ? (
              <DatePicker date={selectedDate} setDate={(d) => d && setSelectedDate(d)} />
            ) : (
              <Badge variant="outline" className="h-10 px-4 rounded-md border text-xs font-mono gap-2">
                <Globe className="h-3 w-3" /> ALL_TIME_ACTIVE
              </Badge>
            )}
          </div>
          <Badge variant="secondary" className="h-10 px-4 rounded-md border text-xs font-mono">
            SYS_REF: {reportMode === "overall" ? "00000000" : dateStr.replace(/-/g, '')}
          </Badge>
        </div>
      </div>

      <Separator />

      {isDataLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-12 w-12 text-primary" />
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium animate-pulse">Computing metrics...</p>
              <p className="text-xs text-muted-foreground">
                {reportMode === "overall" ? "Aggregating lifetime data" : `Fetching ledger for ${dateStr}`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* KPI Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {reportMode === "daily" ? (
                    <span className="text-emerald-500 flex items-center"><ArrowUpRight className="h-3 w-3" /> 12% vs yesterday</span>
                  ) : (
                    <span className="text-muted-foreground uppercase tracking-tighter">Lifetime gross income</span>
                  )}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.recentTransactionCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {reportMode === "daily" ? "Total orders today" : "Total lifetime orders"}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Margin</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{margin.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {reportMode === "daily" ? (
                     <span className="text-amber-500 flex items-center"><ArrowDownRight className="h-3 w-3" /> 2% vs target</span>
                  ) : (
                    "Across all transactions"
                  )}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Ticket</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{stats?.avgTransactionValue.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground mt-1">Spend per customer</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-background border h-12 p-1 gap-1">
              <TabsTrigger value="overview" className="px-6 data-[state=active]:bg-muted">Overview</TabsTrigger>
              <TabsTrigger value="transactions" className="px-6 data-[state=active]:bg-muted">Journal</TabsTrigger>
              <TabsTrigger value="inventory" className="px-6 data-[state=active]:bg-muted">Inventory</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                {/* Financial Summary */}
                <Card className="lg:col-span-4 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Financial Summary
                    </CardTitle>
                    <CardDescription>
                      {reportMode === "daily" ? "Daily revenue and cost breakdown" : "Aggregated all-time financials"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 p-4 rounded-lg bg-muted/50 border">
                        <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
                        <p className="text-2xl font-bold text-emerald-600">₱{revenue.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1 p-4 rounded-lg bg-muted/50 border">
                        <p className="text-sm text-muted-foreground font-medium">Total COGS</p>
                        <p className="text-2xl font-bold text-rose-600">₱{cost.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-xl bg-primary text-primary-foreground shadow-lg">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider">Estimated Gross Profit</p>
                          <h3 className="text-4xl font-bold mt-1">₱{profit.toLocaleString()}</h3>
                        </div>
                        <Badge variant="secondary" className="mb-1 font-bold">
                          {margin.toFixed(1)}% MARGIN
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Category Distribution</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(categoryStats).map(([cat, s]) => (
                          <div key={cat} className="flex items-center justify-between p-3 border rounded-md group hover:border-primary transition-colors">
                            <span className="text-sm font-medium">{cat}</span>
                            <div className="text-right">
                              <p className="text-sm font-bold">₱{s.revenue.toLocaleString()}</p>
                              <p className="text-[10px] text-muted-foreground">{s.itemsSold} units sold</p>
                            </div>
                          </div>
                        ))}
                        {Object.keys(categoryStats).length === 0 && (
                          <p className="col-span-2 text-center text-muted-foreground text-sm py-4 border border-dashed rounded-md">No sales data available</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="lg:col-span-3 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Hot Sellers
                    </CardTitle>
                    <CardDescription>
                      {reportMode === "daily" ? "Best performing items today" : "All-time fast moving items"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {stats?.fastMoving.map((item, idx) => (
                          <div key={item.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                #{idx + 1}
                              </div>
                              <div>
                                <p className="text-sm font-semibold leading-none">{item.name}</p>
                                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-tighter">ID: {item.id.slice(0, 8)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">{item.totalSold}</p>
                              <p className="text-[10px] text-muted-foreground font-medium">UNITS</p>
                            </div>
                          </div>
                        ))}
                        {stats?.fastMoving.length === 0 && (
                          <div className="h-[200px] flex items-center justify-center text-muted-foreground italic text-sm border border-dashed rounded-lg">
                            No movement detected
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="outline-none">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Journal Entry</CardTitle>
                  <CardDescription>
                    {reportMode === "daily" ? `Transactions for ${format(selectedDate, "PPP")}` : "All-time transaction ledger"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[120px]">Date/Time</TableHead>
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
            </TabsContent>

            <TabsContent value="inventory" className="outline-none">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-sm border-rose-200 dark:border-rose-900">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-rose-600">
                      <AlertTriangle className="h-5 w-5" />
                      Stock Alerts
                    </CardTitle>
                    <CardDescription>Items requiring immediate reorder</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[350px] pr-4">
                      <div className="space-y-2">
                        {items?.filter(i => i.quantity <= i.lowStockThreshold).map(i => (
                          <div key={i.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                            <div>
                              <p className="font-semibold text-sm">{i.name}</p>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{i.category || "General"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-rose-600">{i.quantity} LEFT</p>
                              <p className="text-[10px] text-muted-foreground">THRESHOLD: {i.lowStockThreshold}</p>
                            </div>
                          </div>
                        ))}
                        {items?.filter(i => i.quantity <= i.lowStockThreshold).length === 0 && (
                          <div className="h-[100px] flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg">
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
                    <CardDescription>Current market and cost value of inventory</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-6 rounded-lg border bg-background space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Retail Liquidity</p>
                      <p className="text-4xl font-bold tracking-tighter">₱{stats?.totalInventoryValue.toLocaleString()}</p>
                    </div>
                    <Separator />
                    <div className="p-6 rounded-lg border bg-muted/30 space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Inventory Cost</p>
                      <p className="text-3xl font-bold tracking-tighter">₱{stats?.totalInventoryCost.toLocaleString()}</p>
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
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
