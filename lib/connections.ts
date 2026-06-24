// Integration connection state. Mock for now; later derived server-side from env
// (ANTHROPIC_API_KEY present, Google OAuth configured) via the adapters' isConfigured().

export type ConnectionId = "anthropic" | "drive" | "sheets";

export interface Connection {
  id: ConnectionId;
  name: string;
  shortLabel: string;
  connected: boolean;
  required: boolean;
  detail: string;
  envHint: string;
}

export const CONNECTIONS: Connection[] = [
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    shortLabel: "Claude",
    connected: true,
    required: true,
    detail: "API key configured. Powers the structured analysis.",
    envHint: "ANTHROPIC_API_KEY",
  },
  {
    id: "drive",
    name: "Google Drive",
    shortLabel: "Drive",
    connected: false,
    required: false,
    detail: "Not connected — packets won't be filed to a Drive folder (steps will be skipped).",
    envHint: "GOOGLE_OAUTH_REFRESH_TOKEN",
  },
  {
    id: "sheets",
    name: "Google Sheets",
    shortLabel: "Sheets",
    connected: false,
    required: false,
    detail: "Not connected — the tracker row append is disabled (skipped).",
    envHint: "GOOGLE_SHEETS_ID",
  },
];

export function connectedCount(): number {
  return CONNECTIONS.filter((c) => c.connected).length;
}
