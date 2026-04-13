"use client";

import { ShieldCheck } from "lucide-react";
import { AddUserDialog } from "@/components/add-user-dialog";

export function UsersHeader() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Users Module</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
      </div>
      <div className="flex items-center gap-2">
        <AddUserDialog />
      </div>
    </div>
  );
}
