// Serve a generated packet PDF by run id (reads pdf_path from the store).
// Works regardless of Drive — this is the canonical download.
import fs from "node:fs/promises";
import { getRunPdf } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const rec = getRunPdf(id);
  if (!rec || !rec.pdfPath) return new Response("Not found", { status: 404 });

  try {
    const buf = await fs.readFile(rec.pdfPath);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="action-packet.pdf"',
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
