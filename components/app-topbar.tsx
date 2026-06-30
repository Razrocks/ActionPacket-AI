"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ConnectionPills } from "@/components/connection-pills";
import type { Connection } from "@/lib/connections";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/new": "New packet",
  "/history": "History",
  "/connections": "Connections",
};

export function AppTopbar({ connections }: { connections: Connection[] }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const title = TITLES[pathname] ?? (pathname.startsWith("/result") ? "Result" : "ActionPacket AI");

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="text-muted-foreground" />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="text-muted-foreground">ActionPacket AI</BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-3">
        <ConnectionPills connections={connections} />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <Sun className="hidden dark:block" />
          <Moon className="dark:hidden" />
        </Button>
      </div>
    </header>
  );
}
