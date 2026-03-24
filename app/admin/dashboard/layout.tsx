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

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  const navUserData: NavUserData = {
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    avatar: session?.user?.image || undefined,
    role: session?.user?.role || "",
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
      <AppSidebar variant="inset" user={navUserData} />
      <SidebarInset className="relative">
        <SiteHeader />
          <div className="h-full p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
