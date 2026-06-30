import type { Connection } from "@/lib/connections";
import { cn } from "@/lib/utils";

export function ConnectionPills({ connections }: { connections: Connection[] }) {
  return (
    <div className="hidden items-center gap-3 sm:flex">
      {connections.map((c) => (
        <span
          key={c.id}
          title={`${c.name}: ${c.connected ? "connected" : "not connected"}`}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              c.connected ? "bg-emerald-500" : "bg-muted-foreground/40",
            )}
          />
          {c.shortLabel}
        </span>
      ))}
    </div>
  );
}
