"use client";

import * as React from "react";
import type { Icon } from "@tabler/icons-react";
import {
  IconDashboard,
  IconUsers,
  IconPackage,
  IconReport,
  IconSettings,
  IconUserCircle,
  IconInnerShadowTop,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
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
            <Link href="/admin/dashboard" className="flex p-1 rounded-xl justify-center border items-center gap-2 bg-background">
              <Logo className="h-7.5 w-7.5" />
              <p className="font-bold">Tool Tracker</p>
            </Link>
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
