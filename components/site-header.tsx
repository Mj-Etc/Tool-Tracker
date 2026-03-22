"use client";

import useSWR from "swr";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./ui/mode-toggle";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";

type Stats = {
  outOfStock: number;
  lowStock: number;
};

export function SiteHeader() {
  const { data: stats } = useSWR<Stats>("/api/stats", fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <div className="ml-auto flex items-center gap-4">
          <ModeToggle />
          <Link href="/admin/dashboard">
            {stats?.outOfStock ? (
              <span className="relative flex size-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 dark:bg-red-400"></span>
                <span className="relative inline-flex size-4 rounded-full animate-pulse bg-red-400 dark:bg-red-400"></span>
              </span>
            ) : stats?.lowStock ? (
              <span className="relative flex size-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 dark:bg-yellow-400"></span>
                <span className="relative inline-flex size-4 rounded-full animate-pulse bg-yellow-400 dark:bg-yellow-400"></span>
              </span>
            ) : (
              <span className="relative flex size-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 dark:bg-green-400"></span>
                <span className="relative inline-flex size-4 rounded-full animate-pulse bg-green-400 dark:bg-green-400"></span>
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
