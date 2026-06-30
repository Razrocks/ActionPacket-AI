// Static connection metadata (safe to import anywhere, incl. client components).
// Live status is computed server-side in connections.server.ts from env.

export type ConnectionId = "anthropic" | "drive" | "sheets";

export interface ConnectionMeta {
  id: ConnectionId;
  name: string;
  shortLabel: string;
  required: boolean;
  detail: string;
  envHint: string;
}

export interface Connection extends ConnectionMeta {
  connected: boolean;
}

export const CONNECTION_META: ConnectionMeta[] = [
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    shortLabel: "Claude",
    required: true,
    detail: "Powers the structured analysis. Without it, generation can't run.",
    envHint: "ANTHROPIC_API_KEY",
  },
  {
    id: "drive",
    name: "Google Drive",
    shortLabel: "Drive",
    required: false,
    detail: "Files each packet into a dated Drive folder. Skipped when not connected.",
    envHint: "GOOGLE_OAUTH_REFRESH_TOKEN",
  },
  {
    id: "sheets",
    name: "Google Sheets",
    shortLabel: "Sheets",
    required: false,
    detail: "Appends a tracker row per packet. Needs Drive auth plus a sheet ID.",
    envHint: "GOOGLE_SHEETS_ID",
  },
];
