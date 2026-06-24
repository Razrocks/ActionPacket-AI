# Skill: analyze-request

1. **Name:** analyze-request
2. **Purpose:** Convert one Request (intake fields + extracted file text) into a single validated `ActionPacket`.
3. **When to use:** W1 stage S3, after deterministic file extraction, before the validation gate.
4. **When NOT to use:** any control-flow decision, external write, attention finalization, layout/formatting, file parsing — all deterministic.
5. **Required inputs:** `title`, `message`.
6. **Optional inputs:** `requester`, `projectName`, `priority`, `deadline`, `extractedFiles[]` (`{fileName, mime, text | "[no extractable text — OCR not supported in V1]"}`).
7. **Output contract:** `ActionPacket` (see `docs/business-ontology.md` / `src/lib/schema.ts`), enforced by `ActionPacketSchema` via `zodOutputFormat`. Nothing else returned.
8. **Allowed tools:** none. Single structured-output call.
9. **Forbidden tools:** web_search, web_fetch, code_execution, file access, Drive/Sheets, any tool-use loop or sub-agent.
10. **Deterministic dependencies:** `ActionPacketSchema` (validation gate S4), `fileExtractionService` (input), env `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL`; downstream attention logic (S5) overrides `needsAttention`.
11. **Memory usage:** none. Stateless; no cross-run context.
12. **Failure behavior:** Zod validation fail → one retry with a corrective instruction appended; second fail → throw → orchestrator emits `error`, no Run persisted.
13. **Refusal behavior:** `stop_reason==="refusal"` → throw immediately (no retry), surface clean message. (No `fallbacks` in V1 — future hardening.)
14. **Evaluation criteria:** (a) schema always valid; (b) faithfulness — every claim traceable to input, zero invented facts; (c) unknowns → `missingInformation`, not fabricated; (d) deadline fidelity — only present/inferable, vague preserved verbatim, `evidence` set; (e) correct `packetType`; (f) follow-up professional, concise, no invented facts; (g) `confidence` calibrated.

## 15. Full draft (system prompt + call config)

```
MODEL: env ANTHROPIC_MODEL (default claude-opus-4-8)
CALL: client.messages.parse({
  model, max_tokens: 4096,
  thinking: { type: "adaptive" },
  output_config: { format: zodOutputFormat(ActionPacketSchema) },
  system: SYSTEM_PROMPT,
  messages: [{ role: "user", content: USER_BLOCK }]
})
USE: response.parsed_output  (guard null + stop_reason==="refusal")
```

**SYSTEM_PROMPT**
```
You are an operations analyst. Turn a messy inbound work request and its
extracted file text into a structured action packet.

Rules:
- Use ONLY the provided request text and extracted file text as source of truth.
- Do NOT invent facts, names, amounts, or dates. If something is unknown or
  ambiguous, add it to missingInformation — never guess.
- Deadlines: include only those present in or directly inferable from the text.
  Preserve vague deadlines verbatim (e.g. "by Friday" stays "Friday"). Put the
  supporting quote in `evidence`.
- If a file has no extractable text, record that in fileNotes; do not fabricate
  its contents.
- followUpDraft: professional, concise, addresses the missing information; never
  invent commitments or facts.
- Choose the single best packetType.
- Set confidence honestly (0–1) reflecting how complete and unambiguous the input is.
- Return only the structured fields defined by the schema.
```

**USER_BLOCK**
```
REQUEST METADATA
  Title: {title}
  Requester: {requester|unknown}
  Project/Account: {projectName|unknown}
  Stated priority: {priority|none}
  Stated deadline: {deadline|none}

MESSAGE
  {message}

EXTRACTED FILE TEXT
  --- {fileName} ({mime}) ---
  {text | "[no extractable text — OCR not supported in V1]"}
  ...repeat per file; "(no files attached)" if none
```
