// SQLite store (better-sqlite3). The single source of truth for Generations.
// Synchronous on purpose — fast, single-process, used directly in server
// components and route handlers. Marked server-external in next.config.
import Database from "better-sqlite3";
import { SCHEMA_VERSION } from "@/lib/constants";
import { env } from "@/lib/env";
import type { ActionPacket } from "@/lib/schema";
import type { IntegrationStatus, RunResult, RunSummary } from "@/lib/types";

let _db: Database.Database | null = null;

function db(): Database.Database {
  if (_db) return _db;
  const d = new Database(env.sqlitePath());
  d.pragma("journal_mode = WAL");
  d.exec(`
    CREATE TABLE IF NOT EXISTS workflow_runs (
      id                    TEXT PRIMARY KEY,
      schema_version        INTEGER NOT NULL,
      created_at            TEXT NOT NULL,
      title                 TEXT NOT NULL,
      requester             TEXT,
      project_name          TEXT,
      packet_type           TEXT NOT NULL,
      priority              TEXT NOT NULL,
      main_deadline         TEXT,
      needs_attention       INTEGER NOT NULL,
      confidence            REAL NOT NULL,
      run_status            TEXT NOT NULL,
      drive_status          TEXT NOT NULL,
      sheet_status          TEXT NOT NULL,
      pdf_status            TEXT NOT NULL,
      drive_folder_url      TEXT,
      pdf_path              TEXT,
      files_json            TEXT NOT NULL,
      attention_reasons_json TEXT NOT NULL,
      packet_json           TEXT NOT NULL,
      markdown              TEXT NOT NULL
    );
  `);
  _db = d;
  return d;
}

interface Row {
  id: string;
  created_at: string;
  title: string;
  requester: string | null;
  project_name: string | null;
  packet_type: string;
  priority: string;
  main_deadline: string | null;
  needs_attention: number;
  confidence: number;
  drive_status: string;
  sheet_status: string;
  pdf_status: string;
  drive_folder_url: string | null;
  pdf_path: string | null;
  files_json: string;
  attention_reasons_json: string;
  packet_json: string;
}

export interface SaveRunInput {
  id: string;
  createdAt: string;
  packet: ActionPacket;
  markdown: string;
  mainDeadline?: string;
  attentionReasons: string[];
  files: string[];
  driveStatus: IntegrationStatus;
  sheetStatus: IntegrationStatus;
  pdfStatus: "ok" | "failed";
  driveFolderUrl?: string;
  pdfPath?: string;
}

export function saveRun(input: SaveRunInput): void {
  db()
    .prepare(
      `INSERT INTO workflow_runs (
        id, schema_version, created_at, title, requester, project_name,
        packet_type, priority, main_deadline, needs_attention, confidence,
        run_status, drive_status, sheet_status, pdf_status, drive_folder_url,
        pdf_path, files_json, attention_reasons_json, packet_json, markdown
      ) VALUES (
        @id, @schema_version, @created_at, @title, @requester, @project_name,
        @packet_type, @priority, @main_deadline, @needs_attention, @confidence,
        @run_status, @drive_status, @sheet_status, @pdf_status, @drive_folder_url,
        @pdf_path, @files_json, @attention_reasons_json, @packet_json, @markdown
      )`,
    )
    .run({
      id: input.id,
      schema_version: SCHEMA_VERSION,
      created_at: input.createdAt,
      title: input.packet.title,
      requester: input.packet.requester ?? null,
      project_name: input.packet.projectName ?? null,
      packet_type: input.packet.packetType,
      priority: input.packet.priority,
      main_deadline: input.mainDeadline ?? null,
      needs_attention: input.packet.needsAttention ? 1 : 0,
      confidence: input.packet.confidence,
      run_status: "completed",
      drive_status: input.driveStatus,
      sheet_status: input.sheetStatus,
      pdf_status: input.pdfStatus,
      drive_folder_url: input.driveFolderUrl ?? null,
      pdf_path: input.pdfPath ?? null,
      files_json: JSON.stringify(input.files),
      attention_reasons_json: JSON.stringify(input.attentionReasons),
      packet_json: JSON.stringify(input.packet),
      markdown: input.markdown,
    });
}

function toResult(row: Row): RunResult {
  return {
    id: row.id,
    createdAt: row.created_at,
    packet: JSON.parse(row.packet_json) as ActionPacket,
    mainDeadline: row.main_deadline ?? undefined,
    attentionReasons: JSON.parse(row.attention_reasons_json) as string[],
    files: JSON.parse(row.files_json) as string[],
    driveStatus: row.drive_status as IntegrationStatus,
    sheetStatus: row.sheet_status as IntegrationStatus,
    pdfStatus: row.pdf_status as "ok" | "failed",
    driveFolderUrl: row.drive_folder_url ?? undefined,
  };
}

export function getRun(id: string): RunResult | null {
  const row = db().prepare(`SELECT * FROM workflow_runs WHERE id = ?`).get(id) as Row | undefined;
  return row ? toResult(row) : null;
}

export function getRunPdf(id: string): { pdfPath: string | null; markdown: string } | null {
  const row = db()
    .prepare(`SELECT pdf_path, markdown FROM workflow_runs WHERE id = ?`)
    .get(id) as { pdf_path: string | null; markdown: string } | undefined;
  return row ? { pdfPath: row.pdf_path, markdown: row.markdown } : null;
}

export function listRuns(limit = 50): RunSummary[] {
  const rows = db()
    .prepare(
      `SELECT id, created_at, title, requester, project_name, packet_type, priority,
              main_deadline, needs_attention, confidence, drive_status, sheet_status
       FROM workflow_runs ORDER BY created_at DESC LIMIT ?`,
    )
    .all(limit) as Array<
    Pick<
      Row,
      | "id"
      | "created_at"
      | "title"
      | "requester"
      | "project_name"
      | "packet_type"
      | "priority"
      | "main_deadline"
      | "needs_attention"
      | "confidence"
      | "drive_status"
      | "sheet_status"
    >
  >;
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    title: row.title,
    requester: row.requester ?? undefined,
    projectName: row.project_name ?? undefined,
    packetType: row.packet_type as RunSummary["packetType"],
    priority: row.priority as RunSummary["priority"],
    mainDeadline: row.main_deadline ?? undefined,
    needsAttention: row.needs_attention === 1,
    confidence: row.confidence,
    driveStatus: row.drive_status as IntegrationStatus,
    sheetStatus: row.sheet_status as IntegrationStatus,
  }));
}
