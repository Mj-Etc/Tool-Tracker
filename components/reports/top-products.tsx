"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieChart as PieChartIcon } from "lucide-react";
import { Stats, ReportMode } from "./types";

interface TopProductsProps {
  reportMode: ReportMode;
  stats?: Stats;
}

export function TopProducts({ reportMode, stats }: TopProductsProps) {
  return (
    <Card className="lg:col-span-3 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Hot Sellers
        </CardTitle>
        <CardDescription>
          {reportMode === "daily"
            ? "Best performing items today"
            : "Fast moving items"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats?.fastMoving.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  #{idx + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-tighter">
                    ID: {item.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">{item.totalSold}</p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  UNITS
                </p>
              </div>
            </div>
          ))}
          {stats?.fastMoving.length === 0 && (
            <div className="h-50 flex items-center justify-center text-muted-foreground italic text-sm border border-dashed rounded-lg">
              No movement detected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
