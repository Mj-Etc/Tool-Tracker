import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

export const metadata: Metadata = {
  title: "Tool Tracker",
  description: "A System Analysis and Design Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="root"
          enableSystem
          disableTransitionOnChange
        >
          <ScrollArea className="h-screen">
            <TooltipProvider>{children}</TooltipProvider>
          </ScrollArea>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
