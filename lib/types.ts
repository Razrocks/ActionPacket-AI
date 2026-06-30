// AI/domain types come from the Zod schema (lib/schema.ts) — the single source
// of truth. This file re-exports them and adds UI/runtime-only types.
import type { ActionPacket, IntakeInput, PacketType, Priority } from "@/lib/schema";

export type {
  Priority,
  Severity,
  PacketType,
  Task,
  Deadline,
  Risk,
  FileNote,
  ActionPacket,
  IntakeInput,
} from "@/lib/schema";

export type IntegrationStatus = "ok" | "skipped" | "failed";

/** Full result of one Generation (W1) — what the Result page renders. */
export interface RunResult {
  id: string;
  createdAt: string;
  packet: ActionPacket;
  mainDeadline?: string;
  attentionReasons: string[];
  files: string[];
  driveStatus: IntegrationStatus;
  sheetStatus: IntegrationStatus;
  pdfStatus: Exclude<IntegrationStatus, "skipped">;
  driveFolderUrl?: string;
}

/** Compact row for the History page. */
export interface RunSummary {
  id: string;
  createdAt: string;
  title: string;
  requester?: string;
  projectName?: string;
  packetType: PacketType;
  priority: Priority;
  mainDeadline?: string;
  needsAttention: boolean;
  confidence: number;
  driveStatus: IntegrationStatus;
  sheetStatus: IntegrationStatus;
}

/** A one-click demo preset. */
export interface DemoScenario {
  id: string;
  label: string;
  blurb: string;
  input: IntakeInput;
  files: string[];
}

/** Live workflow progress (streamed step events). */
export type StepKey =
  | "reading"
  | "extracting"
  | "analyzing"
  | "packet"
  | "pdf"
  | "drive"
  | "sheets";

export type StepStatus = "pending" | "running" | "ok" | "skipped" | "failed";

export interface WorkflowStep {
  key: StepKey;
  label: string;
  status: StepStatus;
}
