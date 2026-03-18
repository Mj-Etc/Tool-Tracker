"use client";

import * as React from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { UsersTable } from "@/components/users/users-table";
import { UsersSkeleton } from "@/components/users/users-skeleton";
import { UserWithCounts } from "@/components/users/types";
import { AddPersonnelDialog } from "@/components/add-personnel-dialog";
import { ShieldCheck } from "lucide-react";

export default function UsersPage() {
  const { data: users, error, isLoading, mutate } = useSWR<UserWithCounts[]>(
    "/api/users",
    fetcher
  );

  if (isLoading) return <UsersSkeleton />;

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-destructive">
        <p>Authentication failure or cluster unreachable. Access denied.</p>
      </div>
    );
  }

  return (
    <div className="h-auto flex flex-col gap-4 p-4 min-h-screen">
      <div className="flex justify-between items-center px-4 pt-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Security Cluster</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Personnel Management</h2>
        </div>
        <div className="flex items-center gap-2">
          <AddPersonnelDialog />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto border rounded-xl bg-card shadow-sm">
        <UsersTable data={users || []} onUpdate={() => mutate()} />
      </div>
    </div>
  );
}
