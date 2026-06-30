// Server-only: live connection status from env. Never imported by client code.
import "server-only";
import { anthropicConfigured, env, googleConfigured } from "@/lib/env";
import { CONNECTION_META, type Connection, type ConnectionId } from "@/lib/connections";

export function getConnections(): Connection[] {
  const connected: Record<ConnectionId, boolean> = {
    anthropic: anthropicConfigured(),
    drive: googleConfigured(),
    sheets: googleConfigured() && !!env.google.sheetsId(),
  };
  return CONNECTION_META.map((m) => ({ ...m, connected: connected[m.id] }));
}

export function connectedCount(connections: Connection[]): number {
  return connections.filter((c) => c.connected).length;
}
