import { CalendarClock, FileType2, Flag, Gauge } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PACKET_TYPE_LABELS, PRIORITY_META } from "@/lib/mock-data";
import { confidencePct } from "@/lib/format";
import type { RunResult } from "@/lib/types";

export function MetadataCards({ result }: { result: RunResult }) {
  const p = result.packet;
  const items = [
    { icon: Flag, label: "Priority", value: PRIORITY_META[p.priority].label },
    { icon: CalendarClock, label: "Main deadline", value: result.mainDeadline ?? "None stated" },
    { icon: FileType2, label: "Packet type", value: PACKET_TYPE_LABELS[p.packetType] },
    { icon: Gauge, label: "Confidence", value: `${confidencePct(p.confidence)}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ icon: Icon, label, value }) => (
        <Card key={label} className="gap-0 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="size-3.5" />
            {label}
          </div>
          <div className="mt-1 text-sm font-medium">{value}</div>
        </Card>
      ))}
    </div>
  );
}
