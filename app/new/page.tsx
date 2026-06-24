import { PageHeader } from "@/components/page-header";
import { GeneratePanel } from "@/components/generate-panel";

export default function NewPacketPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New action packet"
        description="Paste a messy request, optionally attach files, and generate a structured packet."
      />
      <GeneratePanel />
    </div>
  );
}
