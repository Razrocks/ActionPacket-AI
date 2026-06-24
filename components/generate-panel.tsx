"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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
import { initialSteps, STEP_ORDER } from "@/lib/mock-data";
import type {
  DemoScenario,
  IntakeInput,
  StepStatus,
  WorkflowStep,
} from "@/lib/types";

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
  const [files, setFiles] = React.useState<string[]>([]);
  const [activeDemo, setActiveDemo] = React.useState<string | undefined>();
  const [running, setRunning] = React.useState(false);
  const [steps, setSteps] = React.useState<WorkflowStep[]>(initialSteps);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => {
    return () => timers.current.forEach((t) => clearTimeout(t));
  }, []);

  function selectDemo(scenario: DemoScenario) {
    setValues({ ...EMPTY, ...scenario.input });
    setFiles(scenario.files);
    setActiveDemo(scenario.id);
  }

  function patch(p: Partial<IntakeInput>) {
    setValues((v) => ({ ...v, ...p }));
    setActiveDemo(undefined);
  }

  function run() {
    setRunning(true);
    setSteps(initialSteps());

    let t = 250;
    for (const key of STEP_ORDER) {
      // In the mock, Google steps degrade to "skipped" (no creds wired yet).
      const resolved: StepStatus = key === "drive" || key === "sheets" ? "skipped" : "ok";
      const startAt = t;
      const endAt = t + 600;
      timers.current.push(
        window.setTimeout(
          () => setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, status: "running" } : s))),
          startAt,
        ),
      );
      timers.current.push(
        window.setTimeout(
          () => setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, status: resolved } : s))),
          endAt,
        ),
      );
      t = endAt + 120;
    }

    const dest = activeDemo ?? "lease";
    timers.current.push(window.setTimeout(() => router.push(`/result/${dest}`), t + 400));
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
          <WorkflowProgress steps={steps} />
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
