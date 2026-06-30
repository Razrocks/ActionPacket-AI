// Sheets adapter: append-only tracker row. Ensures the header exists, never edits
// or deletes existing rows.
import "server-only";
import { google } from "googleapis";
import { env } from "@/lib/env";
import { oauthClient } from "@/services/google/auth";

const HEADERS = [
  "Created At",
  "Request Title",
  "Client/Requester",
  "Project/Account",
  "Packet Type",
  "Priority",
  "Main Deadline",
  "Needs Attention",
  "Confidence",
  "Status",
  "Drive Folder Link",
  "PDF Link",
];

export interface TrackerRow {
  createdAt: string;
  title: string;
  requester: string;
  projectName: string;
  packetType: string;
  priority: string;
  mainDeadline: string;
  needsAttention: boolean;
  confidence: number;
  status: string;
  driveFolderUrl: string;
  pdfLink: string;
}

function sheets() {
  return google.sheets({ version: "v4", auth: oauthClient() });
}

export function sheetsConfigured(): boolean {
  return !!env.google.sheetsId();
}

async function ensureHeader(s: ReturnType<typeof sheets>, spreadsheetId: string): Promise<void> {
  const res = await s.spreadsheets.values.get({ spreadsheetId, range: "A1:L1" });
  if (!res.data.values?.[0]?.length) {
    await s.spreadsheets.values.update({
      spreadsheetId,
      range: "A1",
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
  }
}

export async function appendTrackerRow(row: TrackerRow): Promise<void> {
  const spreadsheetId = env.google.sheetsId();
  if (!spreadsheetId) throw new Error("GOOGLE_SHEETS_ID is not set.");
  const s = sheets();
  await ensureHeader(s, spreadsheetId);
  await s.spreadsheets.values.append({
    spreadsheetId,
    range: "A1",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          row.createdAt,
          row.title,
          row.requester,
          row.projectName,
          row.packetType,
          row.priority,
          row.mainDeadline,
          row.needsAttention ? "Yes" : "No",
          row.confidence,
          row.status,
          row.driveFolderUrl,
          row.pdfLink,
        ],
      ],
    },
  });
}
