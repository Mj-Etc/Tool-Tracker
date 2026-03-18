"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
// Modular Components
import { UsersHeader } from "@/components/users/users-header";
import { UsersTable } from "@/components/users/users-table";
import { UsersSkeleton } from "@/components/users/users-skeleton";
import { UserWithCounts } from "@/components/users/types";

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
      <UsersHeader />
      
      <div className="rounded-xl bg-card shadow-sm animate-in fade-in duration-500">
        <UsersTable data={users || []} onUpdate={() => mutate()} />
      </div>
    </div>
  );
}
