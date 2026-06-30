import type { Metadata } from "next";
import { Geist, Geist_Mono, Merriweather } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { getConnections } from "@/lib/connections.server";
import { cn } from "@/lib/utils";

const merriweather = Merriweather({ subsets: ["latin"], variable: "--font-serif" });
const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ActionPacket AI",
  description:
    "Turn messy client requests and files into structured, filed, and tracked action packets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const connections = getConnections();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        merriweather.variable,
        "font-serif",
      )}
    >
      <body className="bg-background font-sans">
        <ThemeProvider>
          <TooltipProvider delayDuration={300}>
            <SidebarProvider>
              <AppSidebar connections={connections} />
              <SidebarInset>
                <AppTopbar connections={connections} />
                <div className="flex flex-1 flex-col p-4 md:p-6">
                  <div className="mx-auto w-full max-w-5xl">{children}</div>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
