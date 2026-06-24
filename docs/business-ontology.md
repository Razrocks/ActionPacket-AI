# Business Ontology (Phase 1)

This document fixes the words everyone — the team and the AI — uses for this product, so the same thing never gets two names. It's grounded in the one job the product does: turning a message like this into something structured and actionable.

## The running example

Throughout this doc we refer to one real request:

> **From a client, to a freelance operations consultant:**
> "Hi, I attached the lease renewal and invoice. Can you review this and send the signed copy by Friday? Also confirm whether the $450 setup fee is included. Let me know if anything is missing."
> *Attached: `lease-renewal.pdf`, `invoice.pdf`*

Every entity below is illustrated with what it means *for this exact request*.

## Why the vocabulary matters

Three different things in this product are easy to call by the same loose word "the request": the **message the client sent**, the **act of processing it**, and the **structured result**. They are not the same, and conflating them causes bugs and confused UI copy. So: the client's message is a **Request**, processing it once is a **Generation**, and the structured result is an **Action Packet**. Hold that distinction and the rest follows.

A second rule: the AI produces *content* (the summary, the tasks, the draft reply). The system produces *records and artifacts* (the saved run, the PDF, the Drive folder, the tracker row). The vocabulary keeps those two worlds separate, because the content is a best-effort reading that must be reviewed, while the records are facts the system is responsible for.

## Entities, with concrete examples

| Entity | What it is | In the running example |
|---|---|---|
| **Operator** | The person using the app — the freelancer/consultant/ops person doing the triage. | The consultant who received the email. |
| **Requester** | The person who *sent* the message. Not the Operator. | The client. |
| **Request** | The raw inbound thing to be processed: the message text plus intake details (title, who it's from, project, optional priority/deadline) plus any attached files. | The lease email + the two PDFs + "title: Lease renewal review". |
| **Attachment** | A file the Operator uploaded as part of the Request. An *input*. | `lease-renewal.pdf`, `invoice.pdf`. |
| **Generation** (internally: *Run*) | One pass of the pipeline over one Request, and the saved record of that pass. The unit you see in History. | The single click of "Generate" on this email, and its saved row. |
| **Action Packet** | The structured, validated result of a Generation — the whole point of the product. One per Generation. | Everything the app hands back for this email (below). |
| **Summary** | A plain-language restatement of what's going on. | "Client sent a lease renewal and invoice; needs the $450 setup fee confirmed and the signed copy back by Friday." |
| **Task** | One concrete thing the Operator must *do*, pulled out of the Request. | "Confirm whether the $450 setup fee is included in the invoice or agreement." |
| **Deadline** | A time commitment found in the source, kept exactly as stated, with the supporting quote. | label: "Signed copy due", dueDate: "Friday", evidence: "send the signed copy by Friday". |
| **Risk** | An ambiguity or hazard that could bite the Operator, with a severity. | "The $450 setup fee may not be clearly stated anywhere" (medium). |
| **Missing-Info Item** | A specific unknown the Operator should chase *before* acting. | "Who is authorized to sign the renewal?" |
| **Follow-Up Draft** | A single professional reply the Operator can copy and send. Never sent automatically. | The drafted "Thanks for sending this over — I'll review and confirm before Friday…" reply. |
| **Recommended Next Step** | A suggested ordering of what to do next. Advisory. | "Reply to the client confirming receipt and asking who should sign." |
| **File Note** | The AI's note about a specific attachment — what it appears to be, key details, or that it couldn't be read. | "`invoice.pdf` — invoice; shows a $450 line item labeled 'setup'." |
| **Artifact** | A file the system *generates*: the packet PDF, the Markdown, `metadata.json`, a copy of the original request text. An *output* (never confused with an Attachment). | `action-packet.pdf`, `action-packet.md`, `metadata.json`. |
| **Drive Folder** | The Google Drive folder the system creates to hold this Generation's Artifacts and Attachments. | `ActionPacket AI / Client - Lease renewal review - 2026-06-24`. |
| **Tracker Row** | One row appended to the Operator's Google Sheet summarizing this Generation. | A line: title, client, packet type, priority, "Friday", needs-attention = yes, confidence, Drive link. |
| **Demo Scenario** | A canned Request (no real files) so the app can be tried instantly. | The "Lease Renewal" preset is this example. |

## Scalars on the Action Packet
These describe the packet as a whole and drive the UI badges, the tracker row, and the attention logic:
- **Packet Type** — which kind of request this is. For the example: `contract_or_agreement`.
- **Priority** — `low` / `medium` / `high` / `urgent`. Here: `high` (money + near deadline).
- **Confidence** — the AI's own 0–1 rating of how complete and unambiguous the input was. ~0.84 here.
- **Needs Attention** — a true/false flag meaning "don't autopilot this." True here, because the deadline is near, money is unconfirmed, and signing authority is unknown.

## State models
| Entity | States | Notes |
|---|---|---|
| **Generation (Run)** | `created → extracting → analyzing → assembling → filing → tracking → completed` ; or `failed` | These are streamed to the screen live as progress steps. The saved record ends `completed` or `failed`. |
| **Integration outcome** (Drive, Sheets — each) | `ok` \| `skipped` (not connected) \| `failed` (errored) | Independent. A skip or failure never aborts the Generation — you still get the packet + PDF. |
| **Action Packet** | `generated` (immutable) | No editing or re-generating in V1. |
| **Request** | `drafting → submitted` | Lives inside the Generation; not stored on its own. |
| **Attention** | `needsAttention: true \| false` | Derived from the packet, never set by hand. |

## Relationship map
```
Operator ──submits──▶ Request ──(has)──▶ Attachment(s)
Request  ──processed by──▶ Generation (1:1) ──produces──▶ Action Packet (1:1)
Action Packet ──made of──▶ Summary · Task[] · Deadline[] · Risk[] · MissingInfoItem[]
                         · RecommendedNextStep[] · FileNote[] · FollowUpDraft
                         + scalars (packetType, priority, confidence, needsAttention, …)
Generation ──creates──▶ Artifact(s)  ──and (if Google connected)──▶ Drive Folder + Tracker Row
Generation ──saved as──▶ a History record
Demo Scenario ──fills in──▶ a Request
```

## Terms we deliberately don't use (and why)
- **"agent"** — there's no agent here, just one AI call that returns structured data. Calling it an agent implies autonomy it doesn't have.
- **"approval", "escalation", "policy", "resolution"** — this product has no approval/governance layer; using those words would imply machinery that doesn't exist.
- **"report"** — say **Action Packet** (or "packet"); "report" is vaguer and overloaded.
- **"user"** — say **Operator** (the app user) or **Requester** (the message sender); "user" hides which one you mean.
- **"client"** — ambiguous between the human Requester and a software SDK client; use **Requester** for the person.
- **"OCR"** — only appears in the "OCR not supported in V1" note for unreadable scans.

## Storage
This file: `docs/business-ontology.md`. Engineering-side names for these concepts (Service, Adapter, WorkflowRun row, etc.) are in `engineering-ontology.md`.
