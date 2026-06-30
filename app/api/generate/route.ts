// W1 entry point. Accepts multipart form-data, validates, then streams NDJSON
// step events while the orchestrator runs. nodejs runtime (sqlite + puppeteer).
import type { NextRequest } from "next/server";
import { IntakeInputSchema } from "@/lib/schema";
import { runGeneration } from "@/services/workflowService";
import type { UploadFile } from "@/services/fileExtractionService";

export const runtime = "nodejs";
export const maxDuration = 120;

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function jsonError(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError(400, "Expected multipart form data.");
  }

  const parsed = IntakeInputSchema.safeParse({
    title: str(form.get("title")),
    requester: str(form.get("requester")) || undefined,
    projectName: str(form.get("projectName")) || undefined,
    message: str(form.get("message")),
    priority: str(form.get("priority")) || undefined,
    deadline: str(form.get("deadline")) || undefined,
  });
  if (!parsed.success) {
    return jsonError(400, parsed.error.issues[0]?.message ?? "Invalid input.");
  }

  const uploads: UploadFile[] = [];
  for (const entry of form.getAll("files")) {
    if (entry instanceof File && entry.size > 0) {
      uploads.push({
        fileName: entry.name,
        mime: entry.type || "application/octet-stream",
        bytes: Buffer.from(await entry.arrayBuffer()),
      });
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const ev of runGeneration(parsed.data, uploads)) {
          controller.enqueue(encoder.encode(JSON.stringify(ev) + "\n"));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed.";
        controller.enqueue(encoder.encode(JSON.stringify({ type: "error", message }) + "\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
