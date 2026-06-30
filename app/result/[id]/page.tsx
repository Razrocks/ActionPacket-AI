import Link from "next/link";
import { AlertTriangle, ArrowLeft, Paperclip } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { MetadataCards } from "@/components/metadata-cards";
import { PacketPreview } from "@/components/packet-preview";
import { DownloadPdfButton, OpenDriveButton } from "@/components/result-actions";
import {
  AttentionBadge,
  ConfidenceBadge,
  IntegrationBadge,
  PacketTypeBadge,
  PriorityBadge,
} from "@/components/status-pills";
import { notFound } from "next/navigation";
import { getRun } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

const ARTIFACTS = ["action-packet.pdf", "action-packet.md", "metadata.json"];

export const dynamic = "force-dynamic";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = getRun(id);
  if (!result) notFound();
  const p = result.packet;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/history">
            <ArrowLeft />
            Back to history
          </Link>
        </Button>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl leading-tight font-semibold tracking-tight text-balance">
            {p.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {p.requester && <span>From {p.requester}</span>}
            {p.projectName && <span> · {p.projectName}</span>}
            <span> · {formatDateTime(result.createdAt)}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <PacketTypeBadge type={p.packetType} />
            <PriorityBadge priority={p.priority} />
            <AttentionBadge needsAttention={p.needsAttention} />
            <ConfidenceBadge confidence={p.confidence} />
          </div>
        </div>
      </div>

      <MetadataCards result={result} />

      {p.needsAttention && p.needsAttentionReason && (
        <div className="flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <div>
            <span className="font-medium">Needs attention.</span>{" "}
            <span className="text-muted-foreground">{p.needsAttentionReason}</span>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PacketPreview packet={p} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <CopyButton text={p.followUpDraft} label="Copy follow-up draft" className="w-full" />
              <DownloadPdfButton id={result.id} available={result.pdfStatus === "ok"} />
              <OpenDriveButton url={result.driveFolderUrl} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Integrations</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <IntegrationBadge label="Drive" status={result.driveStatus} />
              <IntegrationBadge label="Sheets" status={result.sheetStatus} />
              <IntegrationBadge label="PDF" status={result.pdfStatus} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              {result.files.map((f) => (
                <div key={f} className="flex items-center gap-2 text-muted-foreground">
                  <Paperclip className="size-3.5" />
                  <span className="font-mono text-xs">{f}</span>
                </div>
              ))}
              {result.files.length > 0 && <div className="my-2 border-t" />}
              {ARTIFACTS.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Paperclip className="size-3.5 text-primary" />
                  <span className="font-mono text-xs">{f}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
