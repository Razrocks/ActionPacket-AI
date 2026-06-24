"use client";

import { Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function DownloadPdfButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={() => toast.info("PDF generation is wired in a later step (mock UI).")}
    >
      <Download />
      Download PDF
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
