# ActionPacket AI

**Paste a messy client request, drop in the attachments, hit Generate — get back a clear action packet: what they're asking, what you need to do, the deadline, what's risky, what's missing, and a ready-to-send reply. Everything is filed to a Google Drive folder and logged in a tracker sheet automatically.**

---

## The problem it solves

If you're a freelancer, consultant, or the ops person at a small company, you *are* the inbox. Requests land all day — email, Slack, DMs — and they look like this:

> "Hi, I attached the lease renewal and invoice. Can you review this and send the signed copy by Friday? Also confirm whether the $450 setup fee is included. Let me know if anything is missing."
>
> *Attached: lease-renewal.pdf, invoice.pdf*

That one message is deceptively heavy. To handle it you have to: open both PDFs, work out what's actually being asked, notice the Friday deadline, catch that the $450 fee is *unconfirmed*, realize nobody said **who** is allowed to sign, write a professional reply, save the files somewhere sensible, and log it so it doesn't fall through the cracks. Do that thirty times a week and things get dropped — a deadline missed, a fee never confirmed, a document lost in Downloads.

**ActionPacket AI does that triage for you in about 30 seconds.**

## What you get back

Paste the message above, attach the two PDFs, click **Generate**. The result:

- **Summary** — "The client sent a lease renewal and invoice. They need confirmation on whether the $450 setup fee is included and want the signed copy back by Friday."
- **Tasks** — review the lease renewal · confirm whether the $450 setup fee is included · confirm who's authorized to sign · send the signed copy by Friday · reply to the client.
- **Deadline** — *Signed copy due Friday* (flagged).
- **Risks** — the setup fee may not be clearly stated; the signing authority is unclear.
- **Missing information** — Who should sign? Return by email or post? Is the $450 fee one-time or recurring?
- **Follow-up draft** — a polished reply you can copy and send as-is.
- **Metadata** — priority, packet type, a confidence score, and a **Needs attention** flag (this one trips it: a near deadline + unconfirmed money + unclear authority).

Then, without you doing anything else, it:

- creates a **Google Drive folder** — `ActionPacket AI / {Client} - {Request} - {date}` — and drops in the original files, a PDF of the packet, the Markdown, and a `metadata.json`;
- appends a **row to your Google Sheets tracker** so you have a running log of every request, its deadline, and its status.

If you haven't connected Google, you still get the packet and the PDF — those steps just show as *skipped*. The app never dies because one integration is off.

## Who it's for

Freelancers, consultants, small-business operators, project coordinators, virtual assistants — anyone who is the human triage point for messy client/customer requests and needs to understand and act on them fast without losing track.

## How it works (the pipeline)

```
Your request + files
   ─▶ extract text from the files (PDF / TXT / MD)
   ─▶ Claude reads it all and returns a structured packet (validated against a strict schema)
   ─▶ deterministic rules flag "needs attention"
   ─▶ generate Markdown + a polished PDF
   ─▶ create the Drive folder + upload everything
   ─▶ append the tracker row
   ─▶ show you the result, and save it to history
```

Exactly **one** AI step (the reading/understanding). Everything consequential — filing, tracking, flagging, formatting — is plain deterministic code, so it's predictable and the AI can't take an action on your behalf.

## Tech stack

Next.js (App Router, TypeScript) · Tailwind + shadcn/ui · Anthropic SDK (structured output via Zod) · googleapis (Drive + Sheets, OAuth) · better-sqlite3 · Puppeteer (PDF) · pdf-parse.

## Setup

```bash
npm install
cp .env.example .env.local      # set ANTHROPIC_API_KEY
npm run dev                     # http://localhost:3000
```

Google Drive/Sheets are optional. To enable them, run `npm run auth:google` once to authorize your account and paste the printed values into `.env.local`. Required env: `ANTHROPIC_API_KEY`. Optional (enables filing + tracking): the `GOOGLE_OAUTH_*` vars. Secrets are server-only — never exposed to the browser.

## Demo scenarios

Three realistic one-click presets so you can try it without real client data:

1. **Lease Renewal** — the example above (contract + invoice, Friday deadline, unconfirmed fee).
2. **Event Vendor Request** — a client wants help booking catering: dates, a budget, and several missing details.
3. **Website Update Request** — a small-business owner asks for homepage changes, new pricing, and a launch date.

## Current limitations

Single user, no login — it runs on your own machine. No OCR yet: scanned/image-only PDFs are *noted*, not read. Packets can't be edited after generation. Re-running a request creates a fresh Drive folder + tracker row (no de-duping).

## Future

OCR for scanned documents · send the follow-up by email directly · editable / re-generatable packets · multi-user with login · large-document chunking · deploy to a always-on host.

## Design docs

This was planned before it was built. The full design pack lives in [`docs/`](docs/) — start with [`docs/thesis.md`](docs/thesis.md) for what the product is and [`docs/business-ontology.md`](docs/business-ontology.md) for the exact vocabulary. The single AI step is specified in [`skills/analyze-request/skill.md`](skills/analyze-request/skill.md).
