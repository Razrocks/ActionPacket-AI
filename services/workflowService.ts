// W1 orchestrator. Runs the pipeline as an async generator, yielding step events
// for the live UI, degrading external/PDF steps instead of aborting, and
// persisting the run. The one agentic step (analysis) is fenced by the Zod gate.
import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import { computeAttention } from "@/lib/attention";
import { SCHEMA_VERSION } from "@/lib/constants";
import { saveRun } from "@/lib/db";
import type { ActionPacket, IntakeInput } from "@/lib/schema";
import type { IntegrationStatus, StepKey } from "@/lib/types";
import { analyzeRequest } from "@/services/claudeAnalysisService";
import {
  assertUploadsAllowed,
  extractFiles,
  sanitizeFileName,
  type UploadFile,
} from "@/services/fileExtractionService";
import { generateMarkdown } from "@/services/packetGenerationService";
import { renderPdf, runStorageDir } from "@/services/pdfService";

export type WorkflowEvent =
  | { type: "step"; key: StepKey; status: "running" | "ok" | "skipped" | "failed" }
  | { type: "done"; runId: string }
  | { type: "error"; message: string };

function mainDeadline(p: ActionPacket): string | undefined {
  return p.deadlines[0]?.dueDate ?? p.deadlines[0]?.label;
}

function buildOriginal(i: IntakeInput): string {
  return [
    `Title: ${i.title}`,
    i.requester ? `Requester: ${i.requester}` : "",
    i.projectName ? `Project: ${i.projectName}` : "",
    i.priority ? `Priority: ${i.priority}` : "",
    i.deadline ? `Deadline: ${i.deadline}` : "",
    "",
    i.message,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function* runGeneration(
  input: IntakeInput,
  uploads: UploadFile[],
): AsyncGenerator<WorkflowEvent> {
  try {
    // 1. Reading / intake validation
    yield { type: "step", key: "reading", status: "running" };
    assertUploadsAllowed(uploads);
    yield { type: "step", key: "reading", status: "ok" };

    // 2. Extract file text
    yield { type: "step", key: "extracting", status: "running" };
    const extracted = await extractFiles(uploads);
    yield { type: "step", key: "extracting", status: "ok" };

    // 3. AI analysis (fenced by the Zod gate inside analyzeRequest)
    yield { type: "step", key: "analyzing", status: "running" };
    const packet = await analyzeRequest(input, extracted);
    const attention = computeAttention(packet);
    packet.needsAttention = attention.needsAttention;
    if (attention.reasons.length && !packet.needsAttentionReason) {
      packet.needsAttentionReason = attention.reasons[0];
    }
    yield { type: "step", key: "analyzing", status: "ok" };

    const runId = nanoid();
    const createdAt = new Date().toISOString();
    const dir = runStorageDir(runId);
    await fs.mkdir(dir, { recursive: true });
    const fileNames = uploads.map((u) => sanitizeFileName(u.fileName));

    // 4. Markdown packet (+ original request)
    yield { type: "step", key: "packet", status: "running" };
    const markdown = generateMarkdown({ packet, createdAt, files: fileNames });
    await fs.writeFile(path.join(dir, "action-packet.md"), markdown, "utf8");
    await fs.writeFile(path.join(dir, "original-request.txt"), buildOriginal(input), "utf8");
    // persist uploaded originals (for Drive upload later)
    await Promise.all(
      uploads.map((u) =>
        fs.writeFile(path.join(dir, sanitizeFileName(u.fileName)), u.bytes).catch(() => {}),
      ),
    );
    yield { type: "step", key: "packet", status: "ok" };

    // 5. PDF (best-effort — degrade, keep the .md)
    yield { type: "step", key: "pdf", status: "running" };
    let pdfStatus: "ok" | "failed" = "ok";
    let pdfPath: string | undefined;
    try {
      pdfPath = await renderPdf(runId, markdown, packet.title);
      yield { type: "step", key: "pdf", status: "ok" };
    } catch {
      pdfStatus = "failed";
      yield { type: "step", key: "pdf", status: "failed" };
    }

    // 6. Drive filing (Stage 8 — currently skipped)
    yield { type: "step", key: "drive", status: "running" };
    const driveStatus: IntegrationStatus = "skipped";
    const driveFolderUrl: string | undefined = undefined;
    yield { type: "step", key: "drive", status: driveStatus };

    // 7. Sheets tracking (Stage 8 — currently skipped)
    yield { type: "step", key: "sheets", status: "running" };
    const sheetStatus: IntegrationStatus = "skipped";
    yield { type: "step", key: "sheets", status: sheetStatus };

    // metadata.json snapshot (portable trace)
    await fs.writeFile(
      path.join(dir, "metadata.json"),
      JSON.stringify(
        {
          schemaVersion: SCHEMA_VERSION,
          runId,
          createdAt,
          request: input,
          packet,
          attention,
          integrations: { drive: driveStatus, sheets: sheetStatus, pdf: pdfStatus },
          files: fileNames,
        },
        null,
        2,
      ),
      "utf8",
    );

    // 8. Persist
    saveRun({
      id: runId,
      createdAt,
      packet,
      markdown,
      mainDeadline: mainDeadline(packet),
      attentionReasons: attention.reasons,
      files: fileNames,
      driveStatus,
      sheetStatus,
      pdfStatus,
      driveFolderUrl,
      pdfPath,
    });

    yield { type: "done", runId };
  } catch (err) {
    yield { type: "error", message: err instanceof Error ? err.message : "Generation failed." };
  }
}
