"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";
import { ReportMode } from "./types";
import { ScrollArea } from "../ui/scroll-area";

interface FinancialSummaryProps {
  reportMode: ReportMode;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  categoryStats: Record<string, { revenue: number; itemsSold: number }>;
}

export function FinancialSummary({ 
  reportMode, 
  revenue, 
  cost, 
  profit, 
  margin, 
  categoryStats 
}: FinancialSummaryProps) {
  return (
    <Card className="lg:col-span-4 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Financial Summary
        </CardTitle>
        <CardDescription>
          {reportMode === "daily" ? "Daily revenue and cost breakdown" : "Aggregated financials"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
            <p className="text-2xl font-bold">₱{revenue.toLocaleString()}</p>
          </div>
          <div className="space-y-1 p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm text-muted-foreground font-medium">Total COGS</p>
            <p className="text-2xl font-bold">₱{cost.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="p-6 border rounded-xl shadow-lg">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider">Estimated Gross Profit</p>
              <h3 className="text-4xl font-bold mt-1">₱{profit.toLocaleString()}</h3>
            </div>
            <Badge variant="secondary" className="mb-1 font-bold">
              {margin.toFixed(1)}% MARGIN
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Category Distribution</h4>
          <ScrollArea className="*:data-radix-scroll-area-viewport:max-h-35">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-3">
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
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
