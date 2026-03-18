"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import { ReportMode } from "./types";

interface RevenueTrendChartProps {
  reportMode: ReportMode;
  chartData: any[];
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
};

export function RevenueTrendChart({ reportMode, chartData }: RevenueTrendChartProps) {
  if (reportMode === "daily" || reportMode === "overall") return null;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Revenue Trend
        </CardTitle>
        <CardDescription>Daily revenue performance for the selected period</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₱${value.toLocaleString()}`}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
