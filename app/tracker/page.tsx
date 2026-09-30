"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { EMPLOYERS } from "@/lib/employers";
import { useCollection } from "@/lib/store";
import { STATUSES, type Application, type Status } from "@/lib/types";

const OUTCOME: Partial<Record<Status, string>> = {
  Offer: "bg-mint-50 text-mint-600",
  Rejected: "bg-coral-50 text-coral-600",
};

export default function Tracker() {
  const { user, enabled } = useAuth();
  const { items: apps, loaded, update } = useCollection<Application>("applications");
  const [employer, setEmployer] = useState("");
  const [role, setRole] = useState("");
  const [deadline, setDeadline] = useState("");
  const [filter, setFilter] = useState<Status | "All">("All");

  function add() {
    if (!employer.trim()) return;
    update((prev) => [
      ...prev,
      { id: crypto.randomUUID(), employer: employer.trim(), role: role.trim(), deadline, status: "Interested", notes: "" },
    ]);
    setEmployer("");
    setRole("");
    setDeadline("");
  }

  const patch = (id: string, p: Partial<Application>) =>
    update((prev) => prev.map((a) => (a.id === id ? { ...a, ...p } : a)));

  const today = new Date().toISOString().slice(0, 10);
  const active = (a: Application) => a.status !== "Offer" && a.status !== "Rejected";
  const sorted = [...apps]
    .filter((a) => filter === "All" || a.status === filter)
    .sort((a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999"));
  const closingSoon = apps.filter((a) => {
    if (!a.deadline || !active(a) || a.status !== "Interested") return false;
    const days = (Date.parse(a.deadline) - Date.parse(today)) / 86_400_000;
    return days >= 0 && days <= 14;
  });

  return (
    <div className="space-y-6">
      <h1 className="page-title">Application tracker</h1>
      <p className="text-xs text-muted">
        {enabled && user
          ? "Synced to your account."
          : "Saved in this browser only. Clearing site data deletes it. Sign in to sync across devices."}
      </p>

      {closingSoon.length > 0 && (
        <div className="callout bg-sun-50 text-sun-600">
          <strong>Closing within 14 days and not applied yet:</strong>{" "}
          {closingSoon.map((a) => `${a.employer} (${a.deadline})`).join(", ")}
        </div>
      )}

      <form
        className="card grid gap-3 p-4 sm:grid-cols-[1.2fr_1.2fr_auto_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input
          list="employer-suggestions"
          className="input"
          placeholder="Employer"
          aria-label="Employer"
          value={employer}
          onChange={(e) => setEmployer(e.target.value)}
        />
        <datalist id="employer-suggestions">
          {EMPLOYERS.map((e) => (
            <option key={e.name} value={e.name} />
          ))}
        </datalist>
        <input className="input" placeholder="Role" aria-label="Role" value={role} onChange={(e) => setRole(e.target.value)} />
        <input type="date" className="input" aria-label="Closing date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <button className="btn btn-primary" disabled={!employer.trim()}>
          Add
        </button>
      </form>

      <div className="flex flex-wrap gap-2 text-sm">
        {(["All", ...STATUSES] as const).map((s) => {
          const count = s === "All" ? apps.length : apps.filter((a) => a.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`chip ${filter === s ? "chip-active" : ""}`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {sorted.length === 0 && loaded && (
        <div className="card border-dashed p-10 text-center">
          <p className="font-bold">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted">
            Add an employer above, or pick from the <Link href="/employers" className="underline">employer list</Link>.
          </p>
        </div>
      )}
      <ul className="space-y-3">
        {sorted.map((a) => {
          const overdue = a.deadline && a.deadline < today && a.status === "Interested";
          return (
            <li
              key={a.id}
              className="card animate-pop space-y-3 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {a.employer}
                    {OUTCOME[a.status] && (
                      <span className={`ml-2 rounded-md px-2 py-0.5 text-xs font-semibold ${OUTCOME[a.status]}`}>
                        {a.status}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted">{a.role || "No role set"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${overdue ? "bg-coral-50 text-coral-600" : "bg-brand-50 text-brand-700"}`}>
                    {a.deadline ? `Closes ${a.deadline}` : "No date"}
                    {overdue && " (passed)"}
                  </span>
                  <select className="input !w-auto !py-1" aria-label="Status" value={a.status} onChange={(e) => patch(a.id, { status: e.target.value as Status })}>
                    {STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <button className="text-muted hover:text-coral-600" onClick={() => update((p) => p.filter((x) => x.id !== a.id))}>
                    Delete
                  </button>
                </div>
              </div>
              <textarea className="w-full input text-sm" placeholder="Notes" aria-label="Notes" value={a.notes} onChange={(e) => patch(a.id, { notes: e.target.value })} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
