"use client";

import { useSyncExternalStore } from "react";

/**
 * Lightweight trace of what the voice features are doing, for debugging "it isn't hearing me" problems.
 * Technical facts only (device names, byte counts, levels, error names): never audio or what someone said.
 * Entries are kept in memory for the on-screen panel and, in development only, also sent to /api/diag.
 */
export type DiagEntry = { t: string; event: string; data?: Record<string, unknown> };

const MAX = 80;
const EVENT = "da-diag";
const EMPTY: DiagEntry[] = [];
const sid = Math.random().toString(36).slice(2, 8);

type W = Window & { __diag?: DiagEntry[] };

export function diag(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as W;
  const entry: DiagEntry = { t: new Date().toISOString().slice(11, 23), event, data };
  w.__diag = [...(w.__diag ?? []), entry].slice(-MAX);
  window.dispatchEvent(new Event(EVENT));
  if (process.env.NODE_ENV !== "production") {
    try {
      void fetch("/api/diag", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sid, ...entry }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* diagnostics must never break the app */
    }
  }
}

export function useDiag(): DiagEntry[] {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      return () => window.removeEventListener(EVENT, cb);
    },
    () => (window as W).__diag ?? EMPTY,
    () => EMPTY,
  );
}

export function formatDiag(entries: DiagEntry[]): string {
  return entries
    .map((e) => `${e.t} ${e.event}${e.data ? " " + JSON.stringify(e.data) : ""}`)
    .join("\n");
}

let installed = false;
/** Record uncaught errors so a crash in the voice flow shows up in the trace. */
export function installErrorLogging() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  window.addEventListener("error", (e) => diag("window-error", { message: e.message, at: `${e.filename}:${e.lineno}` }));
  window.addEventListener("unhandledrejection", (e) =>
    diag("unhandled-rejection", { reason: String((e.reason as Error)?.message ?? e.reason) }),
  );
}
