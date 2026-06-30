"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DemoScenarios } from "@/components/demo-scenarios";
import { IntakeForm } from "@/components/intake-form";
import { WorkflowProgress } from "@/components/workflow-progress";
import { initialSteps } from "@/lib/mock-data";
import type { DemoScenario, IntakeInput, StepKey, StepStatus, WorkflowStep } from "@/lib/types";

const EMPTY: IntakeInput = {
  title: "",
  requester: "",
  projectName: "",
  message: "",
  priority: undefined,
  deadline: "",
};

export function GeneratePanel() {
  const router = useRouter();
  const [values, setValues] = React.useState<IntakeInput>(EMPTY);
  const [files, setFiles] = React.useState<File[]>([]);
  const [activeDemo, setActiveDemo] = React.useState<string | undefined>();
  const [running, setRunning] = React.useState(false);
  const [steps, setSteps] = React.useState<WorkflowStep[]>(initialSteps);
  const [error, setError] = React.useState<string | null>(null);

  function selectDemo(scenario: DemoScenario) {
    setValues({ ...EMPTY, ...scenario.input });
    setFiles([]); // demo runs on the message text; no real files to attach
    setActiveDemo(scenario.id);
  }

  function patch(p: Partial<IntakeInput>) {
    setValues((v) => ({ ...v, ...p }));
    setActiveDemo(undefined);
  }

  function setStep(key: StepKey, status: StepStatus) {
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, status } : s)));
  }

  async function run() {
    setRunning(true);
    setError(null);
    setSteps(initialSteps());

    const fd = new FormData();
    fd.set("title", values.title);
    fd.set("message", values.message);
    if (values.requester) fd.set("requester", values.requester);
    if (values.projectName) fd.set("projectName", values.projectName);
    if (values.priority) fd.set("priority", values.priority);
    if (values.deadline) fd.set("deadline", values.deadline);
    for (const f of files) fd.append("files", f);

    let res: Response;
    try {
      res = await fetch("/api/generate", { method: "POST", body: fd });
    } catch {
      setError("Network error — could not reach the server.");
      return;
    }

    if (!res.ok || !res.body) {
      const j = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(j?.error ?? "Generation failed.");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let runId: string | undefined;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        let ev: { type: string; key?: StepKey; status?: StepStatus; runId?: string; message?: string };
        try {
          ev = JSON.parse(line);
        } catch {
          continue;
        }
        if (ev.type === "step" && ev.key && ev.status) setStep(ev.key, ev.status);
        else if (ev.type === "done") runId = ev.runId;
        else if (ev.type === "error") setError(ev.message ?? "Generation failed.");
      }
    }

    if (runId) router.push(`/result/${runId}`);
    // otherwise the error state is shown with a "Back to form" action
  }

  function reset() {
    setRunning(false);
    setError(null);
    setSteps(initialSteps());
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Create an action packet</CardTitle>
        <CardDescription>
          Paste a messy request, optionally attach files, and generate a structured packet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {running ? (
          <div className="space-y-4">
            <WorkflowProgress steps={steps} />
            {error && (
              <div className="flex flex-col gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <div>
                    <span className="font-medium">Generation failed.</span>{" "}
                    <span className="text-muted-foreground">{error}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="self-start" onClick={reset}>
                  Back to form
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <DemoScenarios onSelect={selectDemo} activeId={activeDemo} disabled={running} />
            <Separator />
            <IntakeForm
              values={values}
              files={files}
              disabled={running}
              onChange={patch}
              onFilesChange={setFiles}
              onSubmit={run}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
