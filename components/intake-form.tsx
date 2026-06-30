"use client";

import * as React from "react";
import { Paperclip, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IntakeInput, Priority } from "@/lib/types";

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

export function IntakeForm({
  values,
  files,
  disabled,
  onChange,
  onFilesChange,
  onSubmit,
}: {
  values: IntakeInput;
  files: File[];
  disabled?: boolean;
  onChange: (patch: Partial<IntakeInput>) => void;
  onFilesChange: (files: File[]) => void;
  onSubmit: () => void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const canSubmit = values.title.trim().length > 0 && values.message.trim().length > 0;

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const map = new Map(files.map((f) => [f.name, f]));
    for (const f of Array.from(list)) map.set(f.name, f);
    onFilesChange(Array.from(map.values()).slice(0, 5));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit && !disabled) onSubmit();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Request title" required>
          <Input
            value={values.title}
            disabled={disabled}
            placeholder="e.g. Lease renewal review"
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </Field>
        <Field label="Client / requester">
          <Input
            value={values.requester ?? ""}
            disabled={disabled}
            placeholder="e.g. Dana Whitfield"
            onChange={(e) => onChange({ requester: e.target.value })}
          />
        </Field>
        <Field label="Project / account">
          <Input
            value={values.projectName ?? ""}
            disabled={disabled}
            placeholder="e.g. Maple Street Unit 4B"
            onChange={(e) => onChange({ projectName: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority">
            <Select
              value={values.priority ?? ""}
              disabled={disabled}
              onValueChange={(v) => onChange({ priority: v as Priority })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Auto" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Deadline">
            <Input
              value={values.deadline ?? ""}
              disabled={disabled}
              placeholder="e.g. Friday"
              onChange={(e) => onChange({ deadline: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <Field label="Message / request" required>
        <Textarea
          value={values.message}
          disabled={disabled}
          rows={6}
          placeholder="Paste the messy request here…"
          onChange={(e) => onChange({ message: e.target.value })}
        />
      </Field>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Attachments (optional)</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip />
            Add files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.md,.docx"
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {files.map((file) => (
            <span
              key={file.name}
              className="inline-flex items-center gap-1 rounded-md border bg-muted/50 py-1 pr-1 pl-2 text-xs"
            >
              {file.name}
              <button
                type="button"
                disabled={disabled}
                onClick={() => onFilesChange(files.filter((f) => f !== file))}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {files.length === 0 && (
            <span className="text-xs text-muted-foreground">PDF, TXT, MD, DOCX · up to 5</span>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={!canSubmit || disabled} className="w-full">
        <Sparkles />
        Generate action packet
      </Button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
