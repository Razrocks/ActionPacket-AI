// Markdown → styled HTML → PDF (Puppeteer). Best-effort: the caller degrades
// pdf_status to "failed" if this throws (e.g. Chromium missing) and keeps the .md.
import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";
import puppeteer from "puppeteer";
import { packetHtml } from "@/lib/pdfTemplate";

export function runStorageDir(runId: string): string {
  return path.join(process.cwd(), "storage", runId);
}

export async function renderPdf(runId: string, markdown: string, title: string): Promise<string> {
  const dir = runStorageDir(runId);
  await fs.mkdir(dir, { recursive: true });

  const bodyHtml = await marked.parse(markdown);
  const html = packetHtml(bodyHtml, title);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfPath = path.join(dir, "action-packet.pdf");
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
    });
    return pdfPath;
  } finally {
    await browser.close();
  }
}
