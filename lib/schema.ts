// Zod schema = the single source of truth for the AI's structured output.
// The Claude analysis step validates against ActionPacketSchema (the validation
// gate); lib/types.ts re-exports these inferred types so the UI and backend agree.
import { z } from "zod";

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const SEVERITIES = ["low", "medium", "high"] as const;
export const PACKET_TYPES = [
  "client_request",
  "invoice_or_payment",
  "contract_or_agreement",
  "event_coordination",
  "website_or_project_update",
  "general_operations",
] as const;

export const PrioritySchema = z.enum(PRIORITIES);
export const SeveritySchema = z.enum(SEVERITIES);
export const PacketTypeSchema = z.enum(PACKET_TYPES);

export const TaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  owner: z.string().optional(),
  dueDate: z.string().optional(),
  priority: PrioritySchema.optional(),
});

export const DeadlineSchema = z.object({
  label: z.string(),
  dueDate: z.string().optional(),
  evidence: z.string().optional(),
});

export const RiskSchema = z.object({
  title: z.string(),
  severity: SeveritySchema,
  explanation: z.string(),
});

export const FileNoteSchema = z.object({
  fileName: z.string(),
  inferredType: z.string(),
  relevantDetails: z.array(z.string()),
});

export const ActionPacketSchema = z.object({
  title: z.string(),
  packetType: PacketTypeSchema,
  summary: z.string(),
  requester: z.string().optional(),
  projectName: z.string().optional(),
  priority: PrioritySchema,
  confidence: z.number().min(0).max(1),
  needsAttention: z.boolean(),
  needsAttentionReason: z.string().optional(),
  tasks: z.array(TaskSchema),
  deadlines: z.array(DeadlineSchema),
  risks: z.array(RiskSchema),
  missingInformation: z.array(z.string()),
  followUpDraft: z.string(),
  recommendedNextSteps: z.array(z.string()),
  fileNotes: z.array(FileNoteSchema),
});

// Intake form values (validated at the W1 entry point).
export const IntakeInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  requester: z.string().optional(),
  projectName: z.string().optional(),
  message: z.string().min(1, "Request message is required"),
  priority: PrioritySchema.optional(),
  deadline: z.string().optional(),
});

export type Priority = z.infer<typeof PrioritySchema>;
export type Severity = z.infer<typeof SeveritySchema>;
export type PacketType = z.infer<typeof PacketTypeSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Deadline = z.infer<typeof DeadlineSchema>;
export type Risk = z.infer<typeof RiskSchema>;
export type FileNote = z.infer<typeof FileNoteSchema>;
export type ActionPacket = z.infer<typeof ActionPacketSchema>;
export type IntakeInput = z.infer<typeof IntakeInputSchema>;
