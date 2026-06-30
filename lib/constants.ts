// Deterministic limits + labels used across the pipeline and UI.
import type { PacketType } from "@/lib/schema";

export const SCHEMA_VERSION = 1;

export const PACKET_TYPE_LABELS: Record<PacketType, string> = {
  client_request: "Client Request",
  invoice_or_payment: "Invoice / Payment",
  contract_or_agreement: "Contract / Agreement",
  event_coordination: "Event Coordination",
  website_or_project_update: "Website / Project Update",
  general_operations: "General Operations",
};
export const DEFAULT_MODEL = "claude-opus-4-8";

// Upload safety (enforced server-side before extraction).
export const MAX_FILE_COUNT = 5;
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB each

// Allowed upload types → short label used in prompts/notes.
export const ALLOWED_EXT = ["pdf", "txt", "md", "markdown", "docx"] as const;
export const ALLOWED_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/markdown": "md",
  "application/octet-stream": "bin", // fallback; resolved by extension
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export const NO_TEXT_NOTE = "[no extractable text — OCR not supported]";
