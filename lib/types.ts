// Shared UI types for ActionPacket AI.
// These mirror the planned Zod ActionPacketSchema (docs/business-ontology.md).
// When the backend lands, ActionPacket will be replaced by `z.infer<typeof ActionPacketSchema>`.

export type Priority = "low" | "medium" | "high" | "urgent";
export type Severity = "low" | "medium" | "high";

export type PacketType =
  | "client_request"
  | "invoice_or_payment"
  | "contract_or_agreement"
  | "event_coordination"
  | "website_or_project_update"
  | "general_operations";

export type IntegrationStatus = "ok" | "skipped" | "failed";

export interface Task {
  title: string;
  description?: string;
  owner?: string;
  dueDate?: string;
  priority?: Priority;
}

export interface Deadline {
  label: string;
  dueDate?: string;
  evidence?: string;
}

export interface Risk {
  title: string;
  severity: Severity;
  explanation: string;
}

export interface FileNote {
  fileName: string;
  inferredType: string;
  relevantDetails: string[];
}

export interface ActionPacket {
  title: string;
  packetType: PacketType;
  summary: string;
  requester?: string;
  projectName?: string;
  priority: Priority;
  confidence: number;
  needsAttention: boolean;
  needsAttentionReason?: string;
  tasks: Task[];
  deadlines: Deadline[];
  risks: Risk[];
  missingInformation: string[];
  followUpDraft: string;
  recommendedNextSteps: string[];
  fileNotes: FileNote[];
}

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

/** Intake form values. */
export interface IntakeInput {
  title: string;
  requester?: string;
  projectName?: string;
  message: string;
  priority?: Priority;
  deadline?: string;
}

/** A one-click demo preset. */
export interface DemoScenario {
  id: string;
  label: string;
  blurb: string;
  input: IntakeInput;
  files: string[];
}

/** Live workflow progress (streamed step events in the real app; simulated in the mock). */
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
