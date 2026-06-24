import Link from "next/link";
import { AlertTriangle, ArrowRight, FileText, Gauge, Plug, Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AttentionBadge, PacketTypeBadge, PriorityBadge } from "@/components/status-pills";
import { CONNECTIONS, connectedCount } from "@/lib/connections";
import { MOCK_RUNS } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const total = MOCK_RUNS.length;
  const attention = MOCK_RUNS.filter((r) => r.needsAttention).length;
  const avgConfidence = total
    ? Math.round((MOCK_RUNS.reduce((a, r) => a + r.confidence, 0) / total) * 100)
    : 0;
  const recent = MOCK_RUNS.slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your generated action packets.">
        <Button asChild>
          <Link href="/new">
            <Plus />
            New packet
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={FileText} label="Action packets" value={total} />
        <StatCard icon={AlertTriangle} label="Needs attention" value={attention} />
        <StatCard icon={Gauge} label="Avg confidence" value={`${avgConfidence}%`} />
        <StatCard
          icon={Plug}
          label="Connections"
          value={`${connectedCount()}/${CONNECTIONS.length}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent packets</CardTitle>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/history">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-1">
            {recent.map((run) => (
              <Link
                key={run.id}
                href={`/result/${run.id}`}
                className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{run.title}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {run.requester ? `${run.requester} · ` : ""}
                    {formatDate(run.createdAt)}
                  </div>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <PacketTypeBadge type={run.packetType} />
                  <PriorityBadge priority={run.priority} />
                </div>
                <AttentionBadge needsAttention={run.needsAttention} />
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connections</CardTitle>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/connections">Manage</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            {CONNECTIONS.map((c) => (
              <div key={c.id} className="flex items-center gap-2.5 text-sm">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    c.connected ? "bg-emerald-500" : "bg-muted-foreground/40",
                  )}
                />
                <span className="flex-1">{c.name}</span>
                <span
                  className={cn(
                    "text-xs",
                    c.connected ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                  )}
                >
                  {c.connected ? "Connected" : "Off"}
                </span>
              </div>
            ))}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Drive &amp; Sheets are optional — packets still generate without them.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="gap-0 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="mt-2 font-heading text-2xl font-semibold">{value}</div>
    </Card>
  );
}
