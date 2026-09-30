"use client";

import { useEffect, useState } from "react";
import { formatDiag, installErrorLogging, useDiag } from "@/lib/diag";

/** "Having trouble?" panel: shows what the microphone and transcription are actually doing, with a copy button. */
export default function DiagPanel() {
  const entries = useDiag();
  const [copied, setCopied] = useState(false);

  useEffect(() => installErrorLogging(), []);

  return (
    <details className="rounded-lg border border-line bg-soft p-3 text-sm">
      <summary className="cursor-pointer font-semibold">Having trouble? Show diagnostics</summary>
      <div className="mt-3 space-y-2">
        <p className="text-xs text-muted">
          This is a technical log of what your browser and the microphone are doing. It contains no audio and none of
          what you said. If voice isn&apos;t working, copy it and send it over.
        </p>
        <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-md bg-white p-2 text-xs leading-relaxed">
          {entries.length ? formatDiag(entries) : "Nothing yet. Try the microphone test or start an answer."}
        </pre>
        <button
          type="button"
          className="btn btn-secondary !py-1.5"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(formatDiag(entries));
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copied" : "Copy diagnostics"}
        </button>
      </div>
    </details>
  );
}
