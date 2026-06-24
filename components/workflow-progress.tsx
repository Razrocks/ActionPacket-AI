"use client";

import { Check, CircleDashed, Loader2, Minus, X } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { StepStatus, WorkflowStep } from "@/lib/types";

const TERMINAL: StepStatus[] = ["ok", "skipped", "failed"];

export function WorkflowProgress({ steps }: { steps: WorkflowStep[] }) {
  const done = steps.filter((s) => TERMINAL.includes(s.status)).length;
  const pct = Math.round((done / steps.length) * 100);
  const running = done < steps.length;

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            {running && <Loader2 className="size-3.5 animate-spin" />}
            {running ? "Generating action packet…" : "Done"}
          </span>
          <span>
            {done}/{steps.length}
          </span>
        </div>
        <Progress value={pct} />
      </div>

      <ul className="space-y-0.5">
        {steps.map((step) => (
          <li
            key={step.key}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
              step.status === "running" && "bg-muted/60",
            )}
          >
            <StepIcon status={step.status} />
            <span
              className={cn(
                step.status === "pending" && "text-muted-foreground",
                step.status === "skipped" && "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
            {step.status === "skipped" && (
              <span className="ml-auto text-xs text-muted-foreground">skipped</span>
            )}
            {step.status === "failed" && (
              <span className="ml-auto text-xs text-destructive">failed</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case "running":
      return <Loader2 className="size-4 animate-spin text-primary" />;
    case "ok":
      return <Check className="size-4 text-emerald-600 dark:text-emerald-400" />;
    case "skipped":
      return <Minus className="size-4 text-muted-foreground" />;
    case "failed":
      return <X className="size-4 text-destructive" />;
    default:
      return <CircleDashed className="size-4 text-muted-foreground/50" />;
  }
}
