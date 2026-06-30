// One-time: mint a Google OAuth refresh token for Drive + Sheets.
// Run:  npm run auth:google   (loads .env.local for CLIENT_ID/SECRET)
// Then paste the printed GOOGLE_OAUTH_REFRESH_TOKEN into .env.local.
//
// Prereq: in Google Cloud Console, create an OAuth 2.0 Client (type: Web app)
// and add  http://localhost:5179  as an authorized redirect URI.
import http from "node:http";
import { google } from "googleapis";

const PORT = 5179;
const REDIRECT = `http://localhost:${PORT}`;
const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
];

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env.local first.",
  );
  process.exit(1);
}

const oauth = new google.auth.OAuth2(clientId, clientSecret, REDIRECT);
const url = oauth.generateAuthUrl({ access_type: "offline", prompt: "consent", scope: SCOPES });

const server = http.createServer(async (req, res) => {
  const code = new URL(req.url ?? "/", REDIRECT).searchParams.get("code");
  if (!code) {
    res.writeHead(400);
    res.end("No authorization code.");
    return;
  }
  try {
    const { tokens } = await oauth.getToken(code);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h2>Authorized. Close this tab and return to the terminal.</h2>");
    console.log("\n=== Paste into .env.local ===");
    console.log(
      `GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token ?? "(none — revoke the app's access in your Google account and run again)"}`,
    );
    console.log("=============================\n");
  } catch (err) {
    res.writeHead(500);
    res.end("Token exchange failed.");
    console.error(err);
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log("\nOpen this URL to authorize ActionPacket AI:\n");
  console.log(url + "\n");
});
