"use client";

import { Download, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DownloadPdfButton({ id, available }: { id: string; available: boolean }) {
  if (!available) {
    return (
      <Button variant="outline" size="sm" className="w-full" disabled>
        <Download />
        PDF unavailable
      </Button>
    );
  }
  return (
    <Button asChild variant="outline" size="sm" className="w-full">
      <a href={`/api/download/${id}`} target="_blank" rel="noopener noreferrer">
        <Download />
        Download PDF
      </a>
    </Button>
  );
}

export function OpenDriveButton({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <Button asChild variant="outline" size="sm" className="w-full">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <ExternalLink />
        Open Drive folder
      </a>
    </Button>
  );
}
