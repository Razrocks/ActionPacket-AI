import Link from "next/link";
import { ArrowRight, Inbox, Plus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AttentionBadge,
  IntegrationBadge,
  PacketTypeBadge,
  PriorityBadge,
} from "@/components/status-pills";
import { MOCK_RUNS } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="History"
        description="Every generated action packet. Mock data — wired to the tracker later."
      >
        <Button asChild>
          <Link href="/new">
            <Plus />
            New packet
          </Link>
        </Button>
      </PageHeader>

      {MOCK_RUNS.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <Inbox className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No packets yet.</p>
          <Button asChild size="sm">
            <Link href="/">Create one</Link>
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="hidden lg:table-cell">Deadline</TableHead>
                <TableHead className="hidden sm:table-cell">Attention</TableHead>
                <TableHead className="hidden lg:table-cell">Sync</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="text-right">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_RUNS.map((run) => (
                <TableRow key={run.id} className="group">
                  <TableCell>
                    <div className="font-medium">{run.title}</div>
                    {run.requester && (
                      <div className="text-xs text-muted-foreground">{run.requester}</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <PacketTypeBadge type={run.packetType} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={run.priority} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {run.mainDeadline ?? "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <AttentionBadge needsAttention={run.needsAttention} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex gap-1">
                      <IntegrationBadge label="D" status={run.driveStatus} />
                      <IntegrationBadge label="S" status={run.sheetStatus} />
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {formatDate(run.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link href={`/result/${run.id}`} aria-label={`Open ${run.title}`}>
                        <ArrowRight />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
