"use client";

import { format } from "date-fns";
import { BarChart3, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { DatePicker } from "@/components/ui/date-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ReportMode } from "./types";

interface ReportsHeaderProps {
  reportMode: ReportMode;
  setReportMode: (mode: ReportMode) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  startDate?: Date;
  endDate?: Date;
  isToday: boolean;
  isRefreshing: boolean;
  dateStr: string;
}

export function ReportsHeader({
  reportMode,
  setReportMode,
  selectedDate,
  setSelectedDate,
  startDate,
  endDate,
  isRefreshing,
  dateStr,
}: ReportsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 transition-[height] duration-300 ease-in-out">
      <div className="flex flex-col flex-1 min-w-0 mb-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BarChart3 className="h-4 w-4 shrink-0" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">
            Analytics Terminal
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Business Reports</h2>
        <p className="text-[10px] text-muted-foreground uppercase font-mono mt-1 tracking-tighter">
          {reportMode === "overall"
            ? "ALL-TIME AGGREGATED METRICS"
            : reportMode === "weekly"
              ? `${format(startDate!, "MMM d")} - ${format(endDate!, "MMM d, yyyy")}`
              : reportMode === "monthly"
                ? format(selectedDate, "MMMM yyyy")
                : format(selectedDate, "EEEE, MMMM do yyyy")}
        </p>
      </div>

      <div className="flex flex-col items-end gap-4">
        <ToggleGroup
          type="single"
          value={reportMode}
          onValueChange={(v) => v && setReportMode(v as any)}
          className="border p-1 bg-muted/50 rounded-lg"
        >
          <ToggleGroupItem
            value="daily"
            className="px-3 h-7 text-[10px] font-bold uppercase tracking-wider data-[state=on]:bg-background"
          >
            Daily
          </ToggleGroupItem>
          <ToggleGroupItem
            value="weekly"
            className="px-3 h-7 text-[10px] font-bold uppercase tracking-wider data-[state=on]:bg-background"
          >
            Weekly
          </ToggleGroupItem>
          <ToggleGroupItem
            value="monthly"
            className="px-3 h-7 text-[10px] font-bold uppercase tracking-wider data-[state=on]:bg-background"
          >
            Monthly
          </ToggleGroupItem>
          <ToggleGroupItem
            value="overall"
            className="px-3 h-7 text-[10px] font-bold uppercase tracking-wider data-[state=on]:bg-background"
          >
            Overall
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 relative">
            <div className="w-4 h-4 flex items-center justify-center">
              {isRefreshing && (
                <Spinner className="h-3 w-3 text-muted-foreground animate-spin" />
              )}
            </div>
            <div className="min-w-32">
              {reportMode === "overall" ? (
                <Badge
                  variant="outline"
                  className="h-8 w-full px-3 rounded-md border text-[10px] font-mono gap-2 justify-center"
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
            className="h-8 px-3 rounded-md border text-[10px] font-mono shrink-0"
          >
            REF:{" "}
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
    </div>
  );
}
