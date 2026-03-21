import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./ui/mode-toggle";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <div className="ml-auto flex items-center gap-4">
          <ModeToggle />
          {/* Stock Status Identification */}
          <span className="relative flex size-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 dark:bg-green-400"></span>
            <span className="relative inline-flex size-4 rounded-full animate-pulse bg-green-400 dark:bg-green-400"></span>
          </span>
        </div>
      </div>
    </header>
  );
}
