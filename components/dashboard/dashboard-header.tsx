"use client";

import { LayoutDashboard } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex justify-between items-center px-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">System Overview</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
    </div>
  );
}
