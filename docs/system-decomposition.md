# Deterministic vs Agentic Decomposition (Phase 6)

When the lease-renewal email arrives, exactly one step is AI — Claude reading the message and files and returning structure. The other twelve steps are plain, predictable code: extracting text, validating the AI's output, scoring "needs attention," building the PDF, filing to Drive, logging the tracker row, saving the record. This doc draws that line and explains why the consequential parts (anything that flags, files, or writes) must stay deterministic and never be handed to the model.

**Headline:** exactly **one** agentic node — the single Claude analysis call. Everything else is deterministic. The AI extracts content; it never decides control flow, computes the final attention flag, mutates external state, or formats artifacts.

## 1. Subsystems
S1 Intake & validation · S2 File extraction · S3 **AI analysis (Skill)** · S4 Validation gate (Zod) · S5 Attention scoring · S6 Markdown assembly · S7 PDF rendering · S8 Drive filing · S9 Sheets tracking · S10 Persistence/Store · S11 Orchestration & degradation · S12 Streaming progress · S13 UI surfaces.

## 2. Boundary table
| Sub | Purpose | Det/Agentic | Why | In→Out | Deps | Failure |
|---|---|---|---|---|---|---|
| S1 Intake | Validate/normalize | Det | rules | form → IntakeInput | Zod | invalid → 400 |
| S2 Extract | File → text | Det | parsing | Attachment → ExtractedFile | pdf-parse/mammoth | no-text → note |
| **S3 Analysis** | Comprehend/classify/synthesize/draft | **Agentic** | irreducibly fuzzy NL | IntakeInput+text → raw packet | Anthropic SDK | refusal/bad JSON |
| S4 Gate | Enforce schema | Det | correctness | raw → ActionPacket | Zod | parse fail → error |
| S5 Attention | Final needsAttention | Det | reproducible | packet → AttentionResult | constants | — |
| S6 Markdown | Assemble doc | Det | fixed template | packet → markdown | template | — |
| S7 PDF | Render | Det | deterministic render | md → pdf | Puppeteer, marked | launch fail → degrade |
| S8 Drive | Folder + upload | Det | controlled mutation | artifacts → links | googleapis | → degrade |
| S9 Sheets | Append row | Det | mutation | summary → rowRef | googleapis | → degrade |
| S10 Store | Persist Run | Det | durable state | result → row | better-sqlite3 | disk → error |
| S11 Orchestration | Sequence + degrade | Det | control flow | all | — | per-stage caught |
| S12 Streaming | Emit events | Det | signal | stage → StepEvent | stream | — |
| S13 UI | Render | Det | presentation | Store/stream → DOM | React | — |

## 3. Must NOT be agentic
Attention scoring (final flag is rule-based) · Drive filing · Sheets tracking · Markdown/PDF layout · Extraction · Validation · Orchestration. The AI's `needsAttention` is an input, not the authority.

## 4. Recommended V1 decomposition
Modular monolith, one process. Single agentic node (S3) sandwiched: deterministic extract before → validation gate immediately after → deterministic everything downstream. One Claude call, no tool loop, no sub-agents. AI output untrusted until S4 passes. External writes (S8/S9) are leaf, best-effort, degradable.
```
S1 ─▶ S2 ─▶ [S3 Agentic] ─▶ S4 gate ─▶ S5 ─▶ S6 ─▶ S7 ─▶ S8 ─▶ S9 ─▶ S10
        deterministic         ▲ trust boundary        deterministic + degradable tail
```

## 5. Anti-patterns
- ❌ Multi-agent split (extractor + summarizer + drafter).
- ❌ AI as final authority on `needsAttention`.
- ❌ AI deciding to write Drive/Sheets, folder names, or row format.
- ❌ AI emitting Markdown/PDF layout freeform.
- ❌ Agentic tool-use loop for this task.
- ❌ Consuming AI JSON without the Zod gate.
- ❌ AI doing file parsing/OCR.
- ❌ AI choosing filenames / IDs.
