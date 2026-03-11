import { getSession } from "@/lib/auth-helpers";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type NavUserData = {
  name: string;
  email: string;
  avatar?: string;
  role: string;
};

export default async function CashierDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  const navUserData: NavUserData = {
    name: session?.user?.name || "Guest",
    email: session?.user?.email || "",
    avatar: session?.user?.image || undefined,
    role: session?.user?.role || "user",
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar 
        variant="inset" 
        role="cashier" 
        user={navUserData}
      />
      <SidebarInset>
          <SiteHeader />
            <div className="@container/main">
              <div className="p-4">
                {children}
              </div>
          </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
