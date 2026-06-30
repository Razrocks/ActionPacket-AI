// Drive adapter: create a per-packet folder and upload every artifact in the run
// directory. Create-only, scoped to drive.file (the app only ever sees its own files).
import "server-only";
import fs from "node:fs";
import { promises as fsp } from "node:fs";
import path from "node:path";
import { google } from "googleapis";
import { env } from "@/lib/env";
import { oauthClient } from "@/services/google/auth";

const FOLDER_MIME = "application/vnd.google-apps.folder";

function drive() {
  return google.drive({ version: "v3", auth: oauthClient() });
}

async function ensureRoot(d: ReturnType<typeof drive>): Promise<string> {
  const configured = env.google.driveRootFolderId();
  if (configured) return configured;

  const res = await d.files.list({
    q: `name='ActionPacket AI' and mimeType='${FOLDER_MIME}' and trashed=false`,
    fields: "files(id)",
    spaces: "drive",
  });
  const existing = res.data.files?.[0]?.id;
  if (existing) return existing;

  const created = await d.files.create({
    requestBody: { name: "ActionPacket AI", mimeType: FOLDER_MIME },
    fields: "id",
  });
  if (!created.data.id) throw new Error("Failed to create root Drive folder.");
  return created.data.id;
}

/** Creates `{folderName}` under the root and uploads every file in `dir`. */
export async function fileGenerationToDrive(
  folderName: string,
  dir: string,
): Promise<{ folderUrl: string }> {
  const d = drive();
  const parent = await ensureRoot(d);

  const folder = await d.files.create({
    requestBody: { name: folderName, mimeType: FOLDER_MIME, parents: [parent] },
    fields: "id, webViewLink",
  });
  const folderId = folder.data.id;
  if (!folderId) throw new Error("Failed to create Drive folder.");

  const names = await fsp.readdir(dir);
  for (const name of names) {
    await d.files.create({
      requestBody: { name, parents: [folderId] },
      media: { body: fs.createReadStream(path.join(dir, name)) },
      fields: "id",
    });
  }

  return {
    folderUrl: folder.data.webViewLink ?? `https://drive.google.com/drive/folders/${folderId}`,
  };
}
