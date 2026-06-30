# ActionPacket AI

**An end-to-end AI workflow automation system. Paste a messy client request, drop in the attachments, hit Generate — and get back a structured "action packet" (summary, tasks, deadlines, risks, missing info, a ready-to-send reply), a polished PDF, an organized Google Drive folder with every artifact, and a logged row in a Google Sheets tracker. One click turns an ambiguous inbound message into understood, filed, and tracked work.**

---

## The problem it solves

If you're a freelancer, consultant, or the ops person at a small company, you *are* the inbox. Requests land all day — email, Slack, DMs — and they look like this:

> "Hi, I attached the lease renewal and invoice. Can you review this and send the signed copy by Friday? Also confirm whether the $450 setup fee is included. Let me know if anything is missing."
>
> *Attached: lease-renewal.pdf, invoice.pdf*

That one message is deceptively heavy. To handle it properly you have to: open both PDFs, work out what's actually being asked, notice the Friday deadline, catch that the $450 fee is *unconfirmed*, realize nobody said **who** is allowed to sign, write a professional reply, save the files somewhere sensible, and log it so it doesn't fall through the cracks. Now do that thirty times a week, across overlapping clients, and things slip — a deadline missed, a fee never confirmed, a signed document lost in Downloads, a client left waiting.

The hard part isn't any single step. It's that every messy request demands the same exhausting loop of *comprehension → decomposition → drafting → filing → tracking*, and a human has to run it every time. **ActionPacket AI runs that entire loop for you in about 30 seconds** — and leaves behind organized, auditable output instead of a cluttered inbox.

## What you get back

Paste the message above, attach the two PDFs, click **Generate**:

- **Summary** — "The client sent a lease renewal and invoice. They need confirmation on whether the $450 setup fee is included and want the signed copy back by Friday."
- **Tasks** — review the lease renewal · confirm whether the $450 setup fee is included · confirm who's authorized to sign · send the signed copy by Friday · reply to the client.
- **Deadline** — *Signed copy due Friday*, surfaced and flagged.
- **Risks** — the setup fee may not be clearly stated; the signing authority is unclear.
- **Missing information** — Who should sign? Return by email or post? Is the $450 fee one-time or recurring?
- **Follow-up draft** — a professional reply you can copy and send as-is.
- **Metadata** — priority, packet type, a confidence score, and a **Needs attention** flag (this request trips it: a near deadline + unconfirmed money + unclear authority).

Then, with no further action from you, it:

- renders a **professional PDF** of the packet;
- creates a **Google Drive folder** — `ActionPacket AI / {Client} - {Request} - {date}` — and uploads the original files, the PDF, the Markdown, and a `metadata.json` snapshot;
- appends a **row to your Google Sheets tracker** — a running log of every request with its deadline, confidence, status, and links;
- saves the run to local **History** so you can reopen any past packet.

## Who it's for

Freelancers, consultants, small-business operators, project coordinators, virtual assistants — anyone who is the human triage point for messy client and customer requests and needs to understand them, act on them, and never lose track.

## How it works — and why it's more than an AI wrapper

The system is a **deterministic pipeline with exactly one AI step**, streamed live to the browser:

```
Your request + files
   ─▶ extract text from the files (PDF / TXT / Markdown / DOCX)
   ─▶ Claude reads everything and returns a STRUCTURED packet
   ─▶ the output is validated against a strict Zod schema (the validation gate)
   ─▶ deterministic rules compute the "needs attention" flag
   ─▶ generate Markdown + render a polished PDF
   ─▶ create the Drive folder + upload every artifact
   ─▶ append the tracker row
   ─▶ persist the run, then show the result
```

The engineering choices that make it reliable rather than a thin prompt-wrapper:

- **One agentic node, fully fenced.** The model's only job is comprehension — it returns JSON, nothing else. It has **no tools** and cannot file, send, or mutate anything. Every consequential action (flagging, formatting, filing, tracking, persistence) is plain deterministic code. A malicious instruction hidden in an uploaded file can, at worst, produce a misleading packet — never an action taken on your behalf.
- **Structured output behind a validation gate.** Claude's response must parse against a Zod schema before any downstream step trusts it; invalid output is retried, then surfaced as a clean error — never half-rendered.
- **Live-streamed orchestration.** A single streaming request runs the whole pipeline and pushes each step's status to the UI in real time (reading → analyzing → packet → PDF → Drive → Sheets).
- **Graceful degradation.** Drive, Sheets, and even PDF rendering are best-effort: if Google isn't connected or a call fails, that step is marked `skipped`/`failed` and the packet still ships. One integration outage never collapses the run.
- **Durable, auditable record.** Every generation is persisted to SQLite (the source of truth) with a portable `metadata.json` snapshot, independent of Google.


## Architecture & design docs

This system was **fully designed before it was built** — a complete planning pass that locked the product thesis, the shared vocabulary, the deterministic-vs-agentic boundary, the data and runtime architecture, and the security model. That design pack lives in [`docs/`](docs/) and is the best way to understand the system in depth:

| Doc | What it covers |
|---|---|
| [thesis.md](docs/thesis.md) | What the product is, its boundary, and the highest-stakes actions |
| [business-ontology.md](docs/business-ontology.md) | The exact vocabulary (Request, Action Packet, Deadline, …) |
| [engineering-ontology.md](docs/engineering-ontology.md) | The code vocabulary — services, orchestrator, adapters, the validation gate |
| [system-decomposition.md](docs/system-decomposition.md) | The deterministic-vs-agentic split — why only one step is AI |
| [workflow-contracts.md](docs/workflow-contracts.md) | The full W1 "Generate" contract, step by step, including failure behavior |
| [data-architecture.md](docs/data-architecture.md) | Where truth lives for every piece of data |
| [runtime-topology.md](docs/runtime-topology.md) | The one-process runtime, sync vs async, what isn't split out |
| [integrations.md](docs/integrations.md) | How each external system is wrapped and degraded |
| [security.md](docs/security.md) | Secrets, trust boundaries, least-privilege Google scopes, upload safety |

The single AI step has its own spec: [`skills/analyze-request/skill.md`](skills/analyze-request/skill.md) — inputs, output contract, allowed/forbidden tools, failure and refusal behavior, and the system prompt.

## Tech stack

Next.js (App Router, TypeScript) · Tailwind + shadcn/ui · Anthropic SDK (structured output validated with Zod) · googleapis (Drive + Sheets via OAuth) · better-sqlite3 · Puppeteer (PDF) · pdf-parse + mammoth.

## Setup

```bash
npm install
cp .env.example .env.local      # set ANTHROPIC_API_KEY
npm run dev                     # http://localhost:3000
```

`ANTHROPIC_API_KEY` is the only required variable. To enable Drive + Sheets, run `npm run auth:google` once to authorize your Google account, paste the printed `GOOGLE_OAUTH_*` values into `.env.local`, and add your tracker sheet's `GOOGLE_SHEETS_ID`. All secrets are read server-side only — never exposed to the browser.

## Demo scenarios

Three realistic one-click presets, so you can see the full pipeline without real client data:

1. **Lease Renewal** — the example above (contract + invoice, Friday deadline, unconfirmed fee).
2. **Event Vendor Request** — a client wants help booking catering: dates, a budget, and several unconfirmed details.
3. **Website Update Request** — a small-business owner asks for homepage changes, new pricing, and a launch date.
