// Mock data for the un-wired UI. Replaced by real services later.
import type {
  ActionPacket,
  DemoScenario,
  IntegrationStatus,
  PacketType,
  Priority,
  RunResult,
  RunSummary,
  Severity,
  StepKey,
  WorkflowStep,
} from "@/lib/types";

export const PACKET_TYPE_LABELS: Record<PacketType, string> = {
  client_request: "Client Request",
  invoice_or_payment: "Invoice / Payment",
  contract_or_agreement: "Contract / Agreement",
  event_coordination: "Event Coordination",
  website_or_project_update: "Website / Project Update",
  general_operations: "General Operations",
};

export const PRIORITY_META: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
  medium: { label: "Medium", className: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400" },
  high: { label: "High", className: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" },
  urgent: { label: "Urgent", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export const SEVERITY_META: Record<Severity, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
  medium: { label: "Medium", className: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" },
  high: { label: "High", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export const INTEGRATION_META: Record<IntegrationStatus, { label: string; className: string }> = {
  ok: { label: "Synced", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" },
  skipped: { label: "Skipped", className: "bg-muted text-muted-foreground border-border" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export const STEP_LABELS: Record<StepKey, string> = {
  reading: "Reading request",
  extracting: "Extracting files",
  analyzing: "Analyzing with Claude",
  packet: "Generating packet",
  pdf: "Creating PDF",
  drive: "Creating Drive folder",
  sheets: "Updating tracker",
};

export const STEP_ORDER: StepKey[] = [
  "reading",
  "extracting",
  "analyzing",
  "packet",
  "pdf",
  "drive",
  "sheets",
];

export function initialSteps(): WorkflowStep[] {
  return STEP_ORDER.map((key) => ({ key, label: STEP_LABELS[key], status: "pending" }));
}

// ---- Demo scenarios (one-click intake presets) ----
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "lease",
    label: "Lease Renewal",
    blurb: "Lease + invoice review, signed copy by Friday, confirm a $450 fee.",
    files: ["lease-renewal.pdf", "invoice.pdf"],
    input: {
      title: "Lease renewal review + signed copy",
      requester: "Dana Whitfield",
      projectName: "Maple Street Unit 4B",
      priority: "high",
      deadline: "Friday",
      message:
        "Hi, I attached the lease renewal and invoice. Can you review this and send the signed copy by Friday? Also confirm whether the $450 setup fee is included. Let me know if anything is missing.",
    },
  },
  {
    id: "event",
    label: "Event Vendor Request",
    blurb: "Coordinate a catering vendor — dates, budget, and missing details.",
    files: ["vendor-quote.pdf", "guest-list.txt"],
    input: {
      title: "Catering vendor coordination",
      requester: "Marcus Lee",
      projectName: "Q3 Client Appreciation Night",
      priority: "medium",
      deadline: "end of next week",
      message:
        "Can you help line up the caterer for the appreciation night? Budget is around $6k. I think the date is the 18th but need to double check. Attached the quote and a rough guest list — not sure if it's final. Need this sorted by end of next week.",
    },
  },
  {
    id: "website",
    label: "Website Update Request",
    blurb: "Homepage changes, new pricing, and a launch deadline.",
    files: ["pricing-v2.md"],
    input: {
      title: "Homepage + pricing update",
      requester: "Priya Nair",
      projectName: "Northwind Studio site",
      priority: "high",
      deadline: "launch by the 30th",
      message:
        "We want the homepage refreshed and the new pricing live before we launch on the 30th. New pricing is in the attached doc. Also the hero copy needs to change but I haven't finalized it yet. Can you start on what you can?",
    },
  },
];

// ---- Mock packets ----
const leasePacket: ActionPacket = {
  title: "Lease Renewal Review — Maple Street Unit 4B",
  packetType: "contract_or_agreement",
  summary:
    "The client sent a lease renewal and invoice. They need confirmation about whether the $450 setup fee is included and want the signed copy returned by Friday.",
  requester: "Dana Whitfield",
  projectName: "Maple Street Unit 4B",
  priority: "high",
  confidence: 0.84,
  needsAttention: true,
  needsAttentionReason: "Soon deadline plus 3 open questions before the document can be signed.",
  tasks: [
    { title: "Review the lease renewal", priority: "high" },
    { title: "Check whether the $450 setup fee is included in the invoice or agreement", priority: "high" },
    { title: "Confirm who is authorized to sign", priority: "medium" },
    { title: "Send the signed copy back by Friday", dueDate: "Friday", priority: "high" },
    { title: "Reply to the client with confirmation and any missing information", priority: "medium" },
  ],
  deadlines: [
    { label: "Signed copy due", dueDate: "Friday", evidence: "\"send the signed copy by Friday\"" },
  ],
  risks: [
    { title: "Setup fee may not be clearly stated", severity: "medium", explanation: "The $450 fee needs verification against the invoice and agreement before confirming to the client." },
    { title: "Signing authority unclear", severity: "high", explanation: "It is not stated who is authorized to sign the renewal, which could delay return of the signed copy." },
  ],
  missingInformation: [
    "Who should sign the lease renewal?",
    "Should the signed copy be returned by email or another method?",
    "Is the $450 setup fee recurring or one-time?",
  ],
  followUpDraft:
    "Hi Dana — thanks for sending this over. I'll review the lease renewal and invoice, confirm whether the $450 setup fee is included, and get back to you before Friday. Could you also confirm who should sign the renewal and whether you'd like the signed copy returned by email?",
  recommendedNextSteps: [
    "Open the invoice and locate the $450 line item",
    "Confirm the authorized signer with the client",
    "Prepare the signed copy for return before Friday",
  ],
  fileNotes: [
    { fileName: "lease-renewal.pdf", inferredType: "Lease agreement", relevantDetails: ["Renewal terms", "Signature block present"] },
    { fileName: "invoice.pdf", inferredType: "Invoice", relevantDetails: ["Line items include a setup fee", "Amount to verify: $450"] },
  ],
};

const eventPacket: ActionPacket = {
  title: "Catering Coordination — Client Appreciation Night",
  packetType: "event_coordination",
  summary:
    "The client wants help booking a caterer for an appreciation night with a ~$6k budget. The date is tentatively the 18th and the guest list may not be final. A vendor quote and rough guest list were attached.",
  requester: "Marcus Lee",
  projectName: "Q3 Client Appreciation Night",
  priority: "medium",
  confidence: 0.72,
  needsAttention: true,
  needsAttentionReason: "Several unconfirmed details (date, headcount) before the vendor can be booked.",
  tasks: [
    { title: "Confirm the event date", dueDate: "the 18th (to verify)", priority: "high" },
    { title: "Review the vendor quote against the ~$6k budget", priority: "medium" },
    { title: "Confirm the final guest count", priority: "high" },
    { title: "Book the caterer once details are confirmed", dueDate: "end of next week", priority: "medium" },
  ],
  deadlines: [
    { label: "Vendor coordinated", dueDate: "end of next week", evidence: "\"Need this sorted by end of next week\"" },
    { label: "Tentative event date", dueDate: "the 18th", evidence: "\"I think the date is the 18th but need to double check\"" },
  ],
  risks: [
    { title: "Budget may not cover the quote", severity: "medium", explanation: "Budget is approximate (~$6k); the attached quote should be checked against it." },
    { title: "Guest list not final", severity: "medium", explanation: "Headcount drives catering cost; booking before it's final risks rework." },
  ],
  missingInformation: ["What is the confirmed event date?", "What is the final headcount?", "Is $6k a hard budget cap?"],
  followUpDraft:
    "Hi Marcus — happy to coordinate the caterer. Before I book, could you confirm the event date (you mentioned the 18th) and the final guest count? I'll review the attached quote against the ~$6k budget and flag anything over. Aiming to have this locked by end of next week.",
  recommendedNextSteps: ["Verify the date with the client", "Compare the quote to the budget", "Request a finalized guest list"],
  fileNotes: [
    { fileName: "vendor-quote.pdf", inferredType: "Vendor quote", relevantDetails: ["Catering line items", "Compare total to ~$6k budget"] },
    { fileName: "guest-list.txt", inferredType: "Guest list", relevantDetails: ["Marked as rough / possibly not final"] },
  ],
};

const websitePacket: ActionPacket = {
  title: "Homepage + Pricing Update — Northwind Studio",
  packetType: "website_or_project_update",
  summary:
    "The client wants the homepage refreshed and new pricing live before a launch on the 30th. New pricing is provided; hero copy is not yet finalized. They've asked to start on whatever is possible now.",
  requester: "Priya Nair",
  projectName: "Northwind Studio site",
  priority: "high",
  confidence: 0.78,
  needsAttention: true,
  needsAttentionReason: "Firm launch date with unfinalized hero copy creates schedule risk.",
  tasks: [
    { title: "Implement the new pricing from the attached doc", dueDate: "before the 30th", priority: "high" },
    { title: "Refresh the homepage layout", priority: "high" },
    { title: "Hold a placeholder for hero copy until finalized", priority: "medium" },
    { title: "Confirm which homepage sections change", priority: "medium" },
  ],
  deadlines: [{ label: "Launch", dueDate: "the 30th", evidence: "\"before we launch on the 30th\"" }],
  risks: [
    { title: "Hero copy not finalized", severity: "high", explanation: "Final copy is pending; a firm launch date with missing content risks a slip or placeholder going live." },
    { title: "Scope of homepage changes unclear", severity: "medium", explanation: "\"Refreshed\" is not specified — which sections change is undefined." },
  ],
  missingInformation: ["Which homepage sections should change?", "When will final hero copy be ready?", "Are new images/assets needed?"],
  followUpDraft:
    "Hi Priya — I can start on the new pricing now since that's finalized in the doc. For the homepage, could you confirm which sections you want refreshed, and let me know when the hero copy will be ready so it doesn't hold up the 30th launch? I'll set a placeholder in the meantime.",
  recommendedNextSteps: ["Build the new pricing section", "Scope the homepage refresh with the client", "Set a placeholder for hero copy"],
  fileNotes: [{ fileName: "pricing-v2.md", inferredType: "Pricing document", relevantDetails: ["New pricing tiers", "Appears finalized"] }],
};

function mainDeadline(p: ActionPacket): string | undefined {
  return p.deadlines[0]?.dueDate ?? p.deadlines[0]?.label;
}

function buildResult(
  id: string,
  packet: ActionPacket,
  files: string[],
  createdAt: string,
  drive: IntegrationStatus,
  sheet: IntegrationStatus,
): RunResult {
  return {
    id,
    createdAt,
    packet,
    mainDeadline: mainDeadline(packet),
    attentionReasons: packet.needsAttentionReason ? [packet.needsAttentionReason] : [],
    files,
    driveStatus: drive,
    sheetStatus: sheet,
    pdfStatus: "ok",
    driveFolderUrl: drive === "ok" ? "https://drive.google.com/drive/folders/EXAMPLE" : undefined,
  };
}

export const MOCK_RESULTS: Record<string, RunResult> = {
  lease: buildResult("lease", leasePacket, DEMO_SCENARIOS[0].files, "2026-06-22T14:12:00Z", "skipped", "skipped"),
  event: buildResult("event", eventPacket, DEMO_SCENARIOS[1].files, "2026-06-21T09:40:00Z", "ok", "ok"),
  website: buildResult("website", websitePacket, DEMO_SCENARIOS[2].files, "2026-06-20T16:05:00Z", "ok", "failed"),
};

export function getMockResult(id: string): RunResult {
  return MOCK_RESULTS[id] ?? MOCK_RESULTS.lease;
}

export const MOCK_RUNS: RunSummary[] = Object.values(MOCK_RESULTS).map((r) => ({
  id: r.id,
  createdAt: r.createdAt,
  title: r.packet.title,
  requester: r.packet.requester,
  projectName: r.packet.projectName,
  packetType: r.packet.packetType,
  priority: r.packet.priority,
  mainDeadline: r.mainDeadline,
  needsAttention: r.packet.needsAttention,
  confidence: r.packet.confidence,
  driveStatus: r.driveStatus,
  sheetStatus: r.sheetStatus,
}));
