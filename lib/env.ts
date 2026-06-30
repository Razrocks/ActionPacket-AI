// Server-only environment access. Never import from a client component.
// Secrets are read here and nowhere else; isConfigured guards drive degradation.
import { DEFAULT_MODEL } from "@/lib/constants";

function opt(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v : undefined;
}

function req(name: string): string {
  const v = opt(name);
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  anthropicApiKey: () => req("ANTHROPIC_API_KEY"),
  model: () => process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL,
  sqlitePath: () => process.env.SQLITE_PATH?.trim() || "dev.db",
  google: {
    clientId: () => opt("GOOGLE_OAUTH_CLIENT_ID"),
    clientSecret: () => opt("GOOGLE_OAUTH_CLIENT_SECRET"),
    refreshToken: () => opt("GOOGLE_OAUTH_REFRESH_TOKEN"),
    driveRootFolderId: () => opt("GOOGLE_DRIVE_ROOT_FOLDER_ID"),
    sheetsId: () => opt("GOOGLE_SHEETS_ID"),
  },
};

export function anthropicConfigured(): boolean {
  return !!opt("ANTHROPIC_API_KEY");
}

export function googleConfigured(): boolean {
  return !!(
    opt("GOOGLE_OAUTH_CLIENT_ID") &&
    opt("GOOGLE_OAUTH_CLIENT_SECRET") &&
    opt("GOOGLE_OAUTH_REFRESH_TOKEN")
  );
}
