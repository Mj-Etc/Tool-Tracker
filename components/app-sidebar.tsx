"use client";

import * as React from "react";
import type { Icon } from "@tabler/icons-react";
import {
  IconDashboard,
  IconUsers,
  IconPackage,
  IconReport,
  IconSettings,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Logo } from "./logo";

type NavItem = {
  title: string;
  url: string;
  icon: Icon;
};

const adminNavMain: NavItem[] = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Items & Inventory",
    url: "/admin/dashboard/items",
    icon: IconPackage,
  },
  {
    title: "Users",
    url: "/admin/dashboard/users",
    icon: IconUsers,
  },
  {
    title: "Reports",
    url: "/admin/dashboard/reports",
    icon: IconReport,
  },
  {
    title: "Settings",
    url: "/admin/dashboard/settings",
    icon: IconSettings,
  },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const navItems = adminNavMain;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2"
            >
              <div className="bg-primary text-primary-foreground p-2 rounded-full">
                <Logo className="h-5 w-5" />
              </div>
              <p className="font-semibold tracking-tighter">Tool Tracker</p>
            </Link>
            {/* <StarBorder
              className="custom-class w-full border rounded-xl"
              color="magenta"
              speed="5s"
            >
              <div className="py-1 bg-primary-foreground rounded-xl">
                <p className="font-bold">TOOL TRACKER</p>
              </div>
            </StarBorder> */}
            {/* <ElectricBorder
              color="grey"
              dark="white"
              speed={1}
              chaos={0.03}
              borderRadius={12}
            >
              <Link
                href="/admin/dashboard"
                className="flex items-center justify-center p-2 font-semibold text-sm"
              >
                TOOL TRACKER
              </Link>
            </ElectricBorder> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  avatar: user.avatar || "",
                }
              : {
                  name: "",
                  email: "",
                  avatar: "",
                }
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
