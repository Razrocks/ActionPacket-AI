// Shared OAuth2 client for Drive + Sheets. Uses a refresh token minted once via
// scripts/google-auth.ts. Server-only; never instantiated client-side.
import "server-only";
import { google } from "googleapis";
import { env } from "@/lib/env";

export function oauthClient() {
  const clientId = env.google.clientId();
  const clientSecret = env.google.clientSecret();
  const refreshToken = env.google.refreshToken();
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google OAuth is not configured.");
  }
  const client = new google.auth.OAuth2(clientId, clientSecret, "http://localhost");
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}
