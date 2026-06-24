import {
  AlertTriangle,
  ArrowRightCircle,
  CalendarClock,
  FileText,
  HelpCircle,
  ListChecks,
  MessageSquareQuote,
} from "lucide-react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import { PriorityBadge, SeverityBadge } from "@/components/status-pills";
import type { ActionPacket } from "@/lib/types";

export function PacketPreview({ packet }: { packet: ActionPacket }) {
  return (
    <div className="space-y-4">
      <Section icon={FileText} title="Summary">
        <p className="text-sm leading-relaxed text-muted-foreground">{packet.summary}</p>
      </Section>

      <Section icon={ListChecks} title="Tasks" count={packet.tasks.length}>
        <ol className="space-y-2">
          {packet.tasks.map((task, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {i + 1}
              </span>
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {task.title}
                  {task.priority && <PriorityBadge priority={task.priority} />}
                </div>
                {task.description && (
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                  {task.owner && <span>Owner: {task.owner}</span>}
                  {task.dueDate && <span>Due: {task.dueDate}</span>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {packet.deadlines.length > 0 && (
        <Section icon={CalendarClock} title="Deadlines" count={packet.deadlines.length}>
          <ul className="space-y-2">
            {packet.deadlines.map((d, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium">{d.label}</span>
                {d.dueDate && <span className="text-muted-foreground"> — {d.dueDate}</span>}
                {d.evidence && (
                  <p className="mt-0.5 text-xs text-muted-foreground italic">{d.evidence}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {packet.risks.length > 0 && (
        <Section icon={AlertTriangle} title="Risks" count={packet.risks.length}>
          <ul className="space-y-3">
            {packet.risks.map((r, i) => (
              <li key={i} className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {r.title}
                  <SeverityBadge severity={r.severity} />
                </div>
                <p className="text-xs text-muted-foreground">{r.explanation}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {packet.missingInformation.length > 0 && (
        <Section icon={HelpCircle} title="Missing information" count={packet.missingInformation.length}>
          <ul className="space-y-1.5">
            {packet.missingInformation.map((m, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                <HelpCircle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                {m}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquareQuote className="size-4 text-primary" />
            Follow-up draft
          </CardTitle>
          <CardAction>
            <CopyButton text={packet.followUpDraft} label="Copy" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{packet.followUpDraft}</p>
        </CardContent>
      </Card>

      {packet.recommendedNextSteps.length > 0 && (
        <Section icon={ArrowRightCircle} title="Recommended next steps">
          <ul className="space-y-1.5">
            {packet.recommendedNextSteps.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <ArrowRightCircle className="mt-0.5 size-3.5 shrink-0 text-primary" />
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {packet.fileNotes.length > 0 && (
        <Section icon={FileText} title="File notes" count={packet.fileNotes.length}>
          <ul className="space-y-2">
            {packet.fileNotes.map((f, i) => (
              <li key={i} className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="font-mono text-xs">{f.fileName}</span>
                  <span className="text-xs text-muted-foreground">{f.inferredType}</span>
                </div>
                {f.relevantDetails.length > 0 && (
                  <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                    {f.relevantDetails.map((d, j) => (
                      <li key={j}>{d}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-muted-foreground" />
          {title}
          {count !== undefined && (
            <span className="text-xs font-normal text-muted-foreground">({count})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
