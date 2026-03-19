"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, ArrowDownRight, PhilippinePeso, ReceiptText } from "lucide-react";
import { Stats, ReportMode } from "./types";

interface KpiCardsProps {
  revenue: number;
  stats?: Stats;
  reportMode: ReportMode;
  margin: number;
}

export function KpiCards({ revenue, stats, reportMode, margin }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          <PhilippinePeso className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{revenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {reportMode === "daily" ? (
              <span>Gross income today</span>
            ) : reportMode === "weekly" ? (
              <span>Weekly gross income</span>
            ) : reportMode === "monthly" ? (
              <span>Monthly gross income</span>
            ) : (
              <span className="text-muted-foreground uppercase tracking-tighter">Lifetime gross income</span>
            )}
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
          <ReceiptText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.recentTransactionCount || 0}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {reportMode === "daily" ? "Total orders today" : 
             reportMode === "weekly" ? "Total orders this week" :
             reportMode === "monthly" ? "Total orders this month" :
             "Total lifetime orders"}
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
  );
}
