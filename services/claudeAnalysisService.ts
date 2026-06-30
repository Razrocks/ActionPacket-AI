// The one agentic step: read a messy request + extracted file text and return a
// validated ActionPacket. Single structured-output call, no tools, no sub-agents.
// Spec: skills/analyze-request/skill.md.
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { env } from "@/lib/env";
import { ActionPacketSchema, type ActionPacket, type IntakeInput } from "@/lib/schema";

export interface ExtractedFile {
  fileName: string;
  mime: string;
  text: string;
}

/** Claude declined the request (stop_reason: "refusal"). Not retryable. */
export class AnalysisRefusedError extends Error {
  constructor(detail?: string) {
    super(detail ? `Claude declined to analyze this request: ${detail}` : "Claude declined to analyze this request.");
    this.name = "AnalysisRefusedError";
  }
}

/** Model output failed schema validation twice. */
export class AnalysisInvalidError extends Error {
  constructor() {
    super("The analysis could not be produced in the expected format. Please try again.");
    this.name = "AnalysisInvalidError";
  }
}

const SYSTEM_PROMPT = `You are an operations analyst. Turn a messy inbound work request and its extracted file text into a structured action packet.

Rules:
- Use ONLY the provided request text and extracted file text as source of truth.
- Do NOT invent facts, names, amounts, or dates. If something is unknown or ambiguous, add it to missingInformation — never guess.
- Deadlines: include only those present in or directly inferable from the text. Preserve vague deadlines verbatim (e.g. "by Friday" stays "Friday"). Put the supporting quote in evidence.
- If a file has no extractable text, record that in fileNotes; do not fabricate its contents.
- followUpDraft: professional, concise, addresses the missing information; never invent commitments or facts.
- Choose the single best packetType.
- Set confidence honestly (0–1) reflecting how complete and unambiguous the input is.
- Return only the structured fields defined by the schema.`;

function buildUserBlock(input: IntakeInput, files: ExtractedFile[]): string {
  const fileBlock = files.length
    ? files
        .map((f) => `  --- ${f.fileName} (${f.mime}) ---\n${f.text.trim() || "[no extractable text]"}`)
        .join("\n\n")
    : "  (no files attached)";

  return `REQUEST METADATA
  Title: ${input.title}
  Requester: ${input.requester || "unknown"}
  Project/Account: ${input.projectName || "unknown"}
  Stated priority: ${input.priority || "none"}
  Stated deadline: ${input.deadline || "none"}

MESSAGE
${input.message}

EXTRACTED FILE TEXT
${fileBlock}`;
}

export async function analyzeRequest(
  input: IntakeInput,
  files: ExtractedFile[],
): Promise<ActionPacket> {
  const client = new Anthropic({ apiKey: env.anthropicApiKey() });
  const userBlock = buildUserBlock(input, files);

  async function attempt(corrective: boolean): Promise<ActionPacket | null> {
    const messages: Anthropic.MessageParam[] = [{ role: "user", content: userBlock }];
    if (corrective) {
      messages.push({
        role: "user",
        content:
          "Your previous response did not match the required schema. Return ONLY the structured action packet with every required field correctly typed.",
      });
    }

    const response = await client.messages.parse({
      model: env.model(),
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: { format: zodOutputFormat(ActionPacketSchema) },
      system: SYSTEM_PROMPT,
      messages,
    });

    if (response.stop_reason === "refusal") {
      throw new AnalysisRefusedError(response.stop_details?.explanation ?? undefined);
    }
    return response.parsed_output ?? null;
  }

  try {
    const first = await attempt(false);
    if (first) return first;
  } catch (err) {
    if (err instanceof AnalysisRefusedError) throw err;
    // fall through to one retry on parse/validation errors
  }

  const second = await attempt(true);
  if (second) return second;
  throw new AnalysisInvalidError();
}
