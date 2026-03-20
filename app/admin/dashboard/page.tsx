"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
// Modular Components
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

type Stats = {
  totalItems: number;
  outOfStock: number;
  lowStock: number;
  fastMoving: { id: string; name: string; totalSold: number }[];
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useSWR<Stats>("/api/stats", fetcher);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <DashboardHeader />
      
      <div className="animate-in fade-in duration-500 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
            </CardContent>
          </Card>
          <Card className={stats?.lowStock && stats.lowStock > 0 ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" : ""}>
            <Link href="/admin/dashboard/items?status=low-stock">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className={`h-4 w-4 ${stats?.lowStock && stats.lowStock > 0 ? "text-yellow-500" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className={`text-2xl font-bold ${stats?.lowStock && stats.lowStock > 0 ? "text-yellow-600 dark:text-yellow-400" : ""}`}>
                    {stats?.lowStock || 0}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors">
                    Restock items <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
          <Card className={stats?.outOfStock && stats.outOfStock > 0 ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}>
            <Link href="/admin/dashboard/items?status=out-of-stock">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                <AlertCircle className={`h-4 w-4 ${stats?.outOfStock && stats.outOfStock > 0 ? "text-red-500" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className={`text-2xl font-bold ${stats?.outOfStock && stats.outOfStock > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                    {stats?.outOfStock || 0}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors">
                    Restock items <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top 5 Fast-Moving Items (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.fastMoving && stats.fastMoving.length > 0 ? (
                <div className="space-y-4">
                  {stats.fastMoving.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                        {item.totalSold} sold
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-10">No transaction data yet</p>
              )}
            </CardContent>
          </Card>
        
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Welcome to the Tool Tracker Admin Dashboard. Use the sidebar to manage products, view reports, and monitor inventory levels.
              </p>
              <div className="mt-4 p-4 border rounded-lg bg-accent/20">
                <h3 className="font-semibold mb-2">Quick Tips:</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Check Low Stock items daily to avoid stockouts.</li>
                  <li>Review Fast-Moving items to optimize inventory.</li>
                  <li>Generate weekly reports to track sales performance.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
