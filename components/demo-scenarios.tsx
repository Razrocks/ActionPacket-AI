"use client";

import { Sparkles } from "lucide-react";

import { DEMO_SCENARIOS } from "@/lib/mock-data";
import type { DemoScenario } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DemoScenarios({
  onSelect,
  activeId,
  disabled,
}: {
  onSelect: (scenario: DemoScenario) => void;
  activeId?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="size-3.5" />
        Load a demo scenario
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {DEMO_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(scenario)}
            className={cn(
              "group rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-50",
              activeId === scenario.id && "border-primary/50 bg-primary/5",
            )}
          >
            <div className="text-sm font-medium">{scenario.label}</div>
            <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {scenario.blurb}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
