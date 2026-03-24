"use client";

import { Settings2 } from "lucide-react";

export function SettingsHeader() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Settings2 className="h-4 w-4" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">System Config</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Global Settings</h2>
      </div>
    </div>
  );
}
