// Deterministic "needs attention" scoring. Runs after the AI returns; its result
// overrides/supplements the model's own needsAttention flag (the model can't be
// the final authority here).
import type { ActionPacket } from "@/lib/schema";

export interface AttentionResult {
  needsAttention: boolean;
  reasons: string[];
}

function isSoon(due?: string): boolean {
  if (!due) return false;
  const t = Date.parse(due);
  if (Number.isNaN(t)) return false; // vague dates like "Friday" can't be parsed — skip
  const days = (t - Date.now()) / 86_400_000;
  return days >= 0 && days <= 3;
}

export function computeAttention(p: ActionPacket): AttentionResult {
  const reasons: string[] = [];

  if (p.priority === "urgent") reasons.push("Priority is urgent");
  if (p.missingInformation.length > 2) {
    reasons.push(`${p.missingInformation.length} open questions before this can proceed`);
  }
  if (p.risks.some((r) => r.severity === "high")) reasons.push("A high-severity risk was flagged");
  if (p.confidence < 0.7) reasons.push(`Low extraction confidence (${Math.round(p.confidence * 100)}%)`);

  const soon = p.deadlines.find((d) => isSoon(d.dueDate));
  if (soon) reasons.push(`Deadline approaching: ${soon.label}${soon.dueDate ? ` (${soon.dueDate})` : ""}`);

  const needsAttention = reasons.length > 0 || p.needsAttention;
  if (needsAttention && reasons.length === 0 && p.needsAttentionReason) {
    reasons.push(p.needsAttentionReason);
  }

  return { needsAttention, reasons };
}
