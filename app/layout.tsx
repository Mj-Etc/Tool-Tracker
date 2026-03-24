import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventProvider } from "@/components/event-provider";
import { Geist } from "next/font/google";
import { Asimovian } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const asimovian = Asimovian({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-asimovian",
});

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
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable, asimovian.variable)}
    >
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="root"
          enableSystem
          disableTransitionOnChange
        >
          <EventProvider>
            <ScrollArea className="h-screen">
              <TooltipProvider>{children}</TooltipProvider>
            </ScrollArea>
          </EventProvider>
          <Toaster position="top-center" duration={2000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
