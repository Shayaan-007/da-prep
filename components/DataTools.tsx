"use client";

import { useRef, useState } from "react";
import { applyBackup, buildBackup } from "@/lib/backup";
import { clearLocalData } from "@/lib/store";

/** Download, restore or clear everything stored in this browser. Works with or without an account. */
export default function DataTools() {
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  function download() {
    setError("");
    const backup = buildBackup(localStorage);
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `level6-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Backup downloaded.");
  }

  async function restore(f: File) {
    setMsg("");
    setError("");
    try {
      const added = applyBackup(localStorage, JSON.parse(await f.text()));
      setMsg(added ? `Restored ${added} item${added === 1 ? "" : "s"}. Reloading…` : "Nothing new to restore.");
      if (added) setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      setError(e instanceof SyntaxError ? "That file isn't valid JSON." : (e as Error).message);
    }
  }

  return (
    <section className="card space-y-3 p-5">
      <div>
        <h2 className="font-bold">Your data</h2>
        <p className="text-sm text-muted">
          Your tracker, stories and history live in this browser. Download a backup to keep them safe or move them to
          another device.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button onClick={download} className="btn btn-secondary">
          Download backup
        </button>
        <button onClick={() => file.current?.click()} className="btn btn-secondary">
          Restore from backup
        </button>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="Backup file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void restore(f);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => {
            if (!confirm("Delete all data stored in this browser? Download a backup first if you want to keep it.")) return;
            clearLocalData();
            window.location.reload();
          }}
          className="btn btn-danger"
        >
          Clear data on this device
        </button>
      </div>
      {msg && <p className="text-sm text-mint-600">{msg}</p>}
      {error && (
        <p role="alert" className="text-sm text-coral-600">
          {error}
        </p>
      )}
    </section>
  );
}
