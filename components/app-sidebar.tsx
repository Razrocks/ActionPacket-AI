"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  History,
  LayoutDashboard,
  PackageOpen,
  Plug,
  Plus,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { Connection } from "@/lib/connections";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/new", label: "New packet", icon: Plus },
  { href: "/history", label: "History", icon: History },
  { href: "/connections", label: "Connections", icon: Plug },
];

export function AppSidebar({ connections }: { connections: Connection[] }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <PackageOpen className="size-4" />
                </span>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="font-heading font-semibold">ActionPacket AI</span>
                  <span className="text-xs text-muted-foreground">Workflow automation</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href, item.exact)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Connections" className="h-auto">
              <Link href="/connections">
                <Plug />
                <span className="flex-1">Connections</span>
                <span className="flex items-center gap-1">
                  {connections.map((c) => (
                    <span
                      key={c.id}
                      className={cn(
                        "size-1.5 rounded-full",
                        c.connected ? "bg-emerald-500" : "bg-muted-foreground/40",
                      )}
                    />
                  ))}
                  <span className="ml-1 text-xs text-muted-foreground">
                    {connections.filter((c) => c.connected).length}/{connections.length}
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
