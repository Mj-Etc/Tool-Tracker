"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, AlertTriangle, DollarSign, Users, Clock } from "lucide-react";

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
  totalRevenue30Days: number;
  recentTransactionCount: number;
};

export default function ReportsPage() {
  const { data: transactions, isLoading: transLoading } = useSWR<Transaction[]>("/api/transactions", fetcher);
  const { data: items, isLoading: itemsLoading } = useSWR<Item[]>("/api/item/list-items", fetcher);
  const { data: stats, isLoading: statsLoading } = useSWR<Stats>("/api/stats", fetcher);

  if (transLoading || itemsLoading || statsLoading) {
    return <div className="flex h-full items-center justify-center"><Spinner /></div>;
  }

  // Calculate Financials
  const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.totalAmount), 0) || 0;
  
  let totalCost = 0;
  transactions?.forEach(t => {
    t.items.forEach(i => {
      totalCost += (Number(i.item.costPrice) * i.quantity);
    });
  });
  
  const grossProfit = totalRevenue - totalCost;
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Category Analysis
  const categoryStats: Record<string, { revenue: number; itemsSold: number }> = {};
  transactions?.forEach(t => {
    t.items.forEach(i => {
      const cat = i.item.name.split(' ')[0] || "General"; // Proxy for category if not available
      if (!categoryStats[cat]) categoryStats[cat] = { revenue: 0, itemsSold: 0 };
      categoryStats[cat].revenue += Number(i.subtotal);
      categoryStats[cat].itemsSold += i.quantity;
    });
  });

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tight">BUSINESS REPORTS</h1>
        <Badge variant="outline" className="text-xs font-mono uppercase">ToolTrackR v1.0</Badge>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-3 w-3" /> Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">₱{totalRevenue.toLocaleString()}</div>
            <p className="text-[10px] text-green-600 font-bold">LIFETIME SALES</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3 w-3" /> Gross Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{grossMargin.toFixed(1)}%</div>
            <p className="text-[10px] text-blue-600 font-bold">ESTIMATED PROFITABILITY</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
              <Users className="h-3 w-3" /> Avg. Ticket Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">₱{stats?.avgTransactionValue.toFixed(0)}</div>
            <p className="text-[10px] text-purple-600 font-bold">SPEND PER CUSTOMER</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
              <Clock className="h-3 w-3" /> Aging Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{stats?.agingStock || 0}</div>
            <p className="text-[10px] text-orange-600 font-bold">ITEMS &gt; 90 DAYS</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="financials" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="financials" className="rounded-lg font-bold uppercase text-xs">Financials</TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-lg font-bold uppercase text-xs">Inventory Health</TabsTrigger>
          <TabsTrigger value="sales" className="rounded-lg font-bold uppercase text-xs">Sales Performance</TabsTrigger>
          <TabsTrigger value="customers" className="rounded-lg font-bold uppercase text-xs">Customer Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="financials" className="mt-4">
          <Card className="border-2">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-sm font-black uppercase">Income Summary (POS Estimates)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="flex justify-between p-4 bg-green-50 dark:bg-green-950/20">
                  <span className="font-bold">Total Sales (Revenue)</span>
                  <span className="font-black text-green-600">₱{totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-4 bg-red-50 dark:bg-red-950/20">
                  <span className="font-bold">Cost of Goods Sold (COGS)</span>
                  <span className="font-black text-red-600">- ₱{totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-6 border-t-4 border-t-primary bg-primary/5">
                  <span className="text-lg font-black uppercase">Estimated Gross Profit</span>
                  <span className="text-2xl font-black">₱{grossProfit.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-black flex items-center gap-2 uppercase">
                  <AlertTriangle className="h-4 w-4 text-orange-500" /> Reorder / Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {items?.filter(i => i.quantity <= i.lowStockThreshold).map(i => (
                      <div key={i.id} className="flex justify-between items-center p-3 border rounded-lg bg-red-50 dark:bg-red-950/10">
                        <div>
                          <p className="font-bold text-sm">{i.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{i.category || "General"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-red-600">{i.quantity} LEFT</p>
                          <p className="text-[10px] text-muted-foreground">THRESHOLD: {i.lowStockThreshold}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-black flex items-center gap-2 uppercase">
                  <Package className="h-4 w-4 text-blue-500" /> Stock Valuation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border bg-blue-50 dark:bg-blue-950/20">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Total Assets (Retail Value)</p>
                    <p className="text-3xl font-black">₱{stats?.totalInventoryValue.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Assets (Cost Value)</p>
                    <p className="text-3xl font-black">₱{stats?.totalInventoryCost.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase">Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(categoryStats).map(([cat, s]) => (
                  <div key={cat} className="p-4 border rounded-xl hover:shadow-md transition-shadow">
                    <h3 className="font-black text-lg mb-2">{cat}</h3>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground font-bold">Revenue:</span>
                      <span className="font-black text-primary">₱{s.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-bold">Qty Sold:</span>
                      <span className="font-black">{s.itemsSold}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase">Contractor / Professional Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background border-b z-10">
                    <tr>
                      <th className="text-left py-4 px-4 font-black uppercase text-xs">Customer Name</th>
                      <th className="text-left py-4 px-4 font-black uppercase text-xs">Date</th>
                      <th className="text-right py-4 px-4 font-black uppercase text-xs">Transaction ID</th>
                      <th className="text-right py-4 px-4 font-black uppercase text-xs">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.filter(t => t.customerName).map((t) => (
                      <tr key={t.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-primary">{t.customerName}</td>
                        <td className="py-4 px-4 text-muted-foreground text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-4 text-right font-mono text-[10px]">{t.id}</td>
                        <td className="py-4 px-4 text-right font-black">₱{Number(t.totalAmount).toFixed(2)}</td>
                      </tr>
                    ))}
                    {transactions?.filter(t => t.customerName).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-muted-foreground italic">No professional/contractor sales recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
