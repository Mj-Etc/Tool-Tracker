"use client";

import { SettingsHeader } from "@/components/settings/settings-header";

export default function SettingsPage() {
  return (
    <div className="h-auto flex flex-col gap-4 p-4 min-h-screen">
      <SettingsHeader />
      <div className="animate-in fade-in duration-500 flex-1 flex items-center justify-center border rounded-xl bg-card shadow-sm border-dashed">
        <p className="text-muted-foreground italic">Settings module is under construction.</p>
      </div>
    </div>
  );
}
