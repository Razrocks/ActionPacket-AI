// Deterministic Markdown assembly from a validated ActionPacket.
// This Markdown is both an artifact (action-packet.md) and the PDF source.
import { PACKET_TYPE_LABELS } from "@/lib/constants";
import type { ActionPacket } from "@/lib/schema";

export interface PacketDocInput {
  packet: ActionPacket;
  createdAt: string;
  files: string[];
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function generateMarkdown({ packet, createdAt, files }: PacketDocInput): string {
  const L: string[] = [];
  L.push(`# ${packet.title}`);
  L.push("");
  L.push(`**Generated:** ${fmtDate(createdAt)}  `);
  if (packet.requester) L.push(`**Requester:** ${packet.requester}  `);
  if (packet.projectName) L.push(`**Project / Account:** ${packet.projectName}  `);
  L.push(`**Packet type:** ${PACKET_TYPE_LABELS[packet.packetType]}`);
  L.push("");

  L.push("## Summary");
  L.push(packet.summary);
  L.push("");

  L.push("## Tasks");
  if (packet.tasks.length) {
    packet.tasks.forEach((t, i) => {
      const bits = [t.dueDate ? `due ${t.dueDate}` : "", t.owner ? `owner ${t.owner}` : "", t.priority ? `${t.priority} priority` : ""].filter(Boolean);
      L.push(`${i + 1}. **${t.title}**${bits.length ? ` _(${bits.join(" · ")})_` : ""}`);
      if (t.description) L.push(`   ${t.description}`);
    });
  } else {
    L.push("_None identified._");
  }
  L.push("");

  L.push("## Deadlines");
  if (packet.deadlines.length) {
    packet.deadlines.forEach((d) => {
      L.push(`- **${d.label}**${d.dueDate ? `: ${d.dueDate}` : ""}${d.evidence ? ` — _${d.evidence}_` : ""}`);
    });
  } else {
    L.push("_None stated._");
  }
  L.push("");

  L.push("## Risks");
  if (packet.risks.length) {
    packet.risks.forEach((r) => L.push(`- **${r.title}** (${r.severity}) — ${r.explanation}`));
  } else {
    L.push("_None flagged._");
  }
  L.push("");

  L.push("## Missing information");
  if (packet.missingInformation.length) {
    packet.missingInformation.forEach((m) => L.push(`- ${m}`));
  } else {
    L.push("_Nothing outstanding._");
  }
  L.push("");

  L.push("## Follow-up draft");
  L.push("> " + packet.followUpDraft.replace(/\n/g, "\n> "));
  L.push("");

  if (packet.recommendedNextSteps.length) {
    L.push("## Recommended next steps");
    packet.recommendedNextSteps.forEach((s) => L.push(`- ${s}`));
    L.push("");
  }

  L.push("## Uploaded files");
  if (files.length) {
    files.forEach((f) => L.push(`- ${f}`));
  } else {
    L.push("_None._");
  }
  L.push("");

  if (packet.fileNotes.length) {
    L.push("## File notes");
    packet.fileNotes.forEach((n) => {
      L.push(`- **${n.fileName}** (${n.inferredType})`);
      n.relevantDetails.forEach((d) => L.push(`  - ${d}`));
    });
    L.push("");
  }

  L.push("## Metadata");
  L.push(`- **Priority:** ${packet.priority}`);
  L.push(`- **Confidence:** ${Math.round(packet.confidence * 100)}%`);
  L.push(`- **Needs attention:** ${packet.needsAttention ? "Yes" : "No"}`);
  if (packet.needsAttention && packet.needsAttentionReason) {
    L.push(`- **Reason:** ${packet.needsAttentionReason}`);
  }
  L.push("");

  return L.join("\n");
}
