import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  INTEGRATION_META,
  PACKET_TYPE_LABELS,
  PRIORITY_META,
  SEVERITY_META,
} from "@/lib/mock-data";
import { confidencePct } from "@/lib/format";
import type {
  IntegrationStatus,
  PacketType,
  Priority,
  Severity,
} from "@/lib/types";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return (
    <Badge variant="outline" className={cn("font-medium", meta.className)}>
      {meta.label}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity];
  return (
    <Badge variant="outline" className={cn("font-medium", meta.className)}>
      {meta.label} risk
    </Badge>
  );
}

export function PacketTypeBadge({ type }: { type: PacketType }) {
  return (
    <Badge variant="outline" className="font-medium text-muted-foreground">
      {PACKET_TYPE_LABELS[type]}
    </Badge>
  );
}

export function IntegrationBadge({
  label,
  status,
}: {
  label: string;
  status: IntegrationStatus;
}) {
  const meta = INTEGRATION_META[status];
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", meta.className)}>
      <span className="text-muted-foreground/80">{label}</span>
      {meta.label}
    </Badge>
  );
}

export function AttentionBadge({ needsAttention }: { needsAttention: boolean }) {
  if (needsAttention) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-destructive/20 bg-destructive/10 font-medium text-destructive"
      >
        <AlertTriangle className="size-3" />
        Needs attention
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="gap-1 border-emerald-500/20 bg-emerald-500/10 font-medium text-emerald-600 dark:text-emerald-400"
    >
      <ShieldCheck className="size-3" />
      Clear
    </Badge>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = confidencePct(confidence);
  const tone =
    pct >= 80
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : pct >= 70
        ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "border-destructive/20 bg-destructive/10 text-destructive";
  return (
    <Badge variant="outline" className={cn("gap-1 font-medium", tone)}>
      <CheckCircle2 className="size-3" />
      {pct}% confidence
    </Badge>
  );
}
