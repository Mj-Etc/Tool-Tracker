"use client";

import { format } from "date-fns";
import { LayoutDashboard, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  isToday,
  isRefreshing,
  dateStr,
}: ReportsHeaderProps) {
  return (
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
  );
}
