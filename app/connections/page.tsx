import { Bot, FolderTree, Table2 } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CONNECTIONS, type ConnectionId } from "@/lib/connections";
import { cn } from "@/lib/utils";

const ICONS: Record<ConnectionId, React.ComponentType<{ className?: string }>> = {
  anthropic: Bot,
  drive: FolderTree,
  sheets: Table2,
};

export default function ConnectionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Connections"
        description="Integrations are configured via environment variables in .env.local. This page reflects current status."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {CONNECTIONS.map((c) => {
          const Icon = ICONS[c.id];
          return (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4" />
                  </span>
                  {c.name}
                </CardTitle>
                <CardAction>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium",
                      c.connected
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {c.connected ? "Connected" : "Not connected"}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{c.detail}</p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="font-mono text-muted-foreground">
                    {c.envHint}
                  </Badge>
                  <span className="text-muted-foreground">{c.required ? "Required" : "Optional"}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
