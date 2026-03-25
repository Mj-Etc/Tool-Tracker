"use client";

import useSWR from "swr";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./ui/mode-toggle";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import { StatusDot } from "./status-dot";

type Stats = {
  outOfStock: number;
  lowStock: number;
};

export function SiteHeader() {
  const { data: stats = { outOfStock: 0, lowStock: 0 } } = useSWR<Stats>(
    "/api/stats",
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <div className="ml-auto flex items-center gap-4">
          <ModeToggle />
          <Link href="/admin/dashboard">
            <StatusDot
              outOfStock={stats.outOfStock}
              lowStock={stats.lowStock}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
