"use client";

import Link from "next/link";
import ProgressBar from "@/components/Progress";
import { CATEGORY_INFO, type Category } from "@/lib/questions";
import { useCollection } from "@/lib/store";
import type { PracticeRecord, SessionRecord } from "@/lib/types";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default function Progress() {
  const sessions = useCollection<SessionRecord>("sessions");
  const practice = useCollection<PracticeRecord>("practice");

  const recent = sessions.items.slice(0, 10).reverse();
  const avg = sessions.items.length
    ? Math.round(sessions.items.reduce((s, x) => s + x.overall, 0) / sessions.items.length)
    : null;

  const byCategory = new Map<string, PracticeRecord[]>();
  practice.items.forEach((r) => byCategory.set(r.category, [...(byCategory.get(r.category) ?? []), r]));

  const empty = sessions.loaded && practice.loaded && !sessions.items.length && !practice.items.length;

  return (
    <div className="space-y-8">
      <h1 className="page-title">Your progress</h1>
      {empty && (
        <p className="text-muted">
          Nothing yet. Try a <Link href="/interview" className="underline">mock interview</Link> or a{" "}
          <Link href="/practice" className="underline">practice test</Link>.
        </p>
      )}

      {sessions.items.length > 0 && (
        <section className="card space-y-4 p-5">
          <h2 className="font-bold">
            Mock interviews ({sessions.items.length}) · average {avg}/100
          </h2>
          <ul className="space-y-2" aria-label="Recent interview scores, oldest first">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center gap-3 text-sm">
                <span className="w-14 shrink-0 text-muted">{fmt(s.date)}</span>
                <ProgressBar value={s.overall} label={`Score ${s.overall} out of 100`} className="flex-1" />
                <span className="w-10 text-right font-semibold">{s.overall}</span>
              </li>
            ))}
          </ul>
          <details className="text-sm">
            <summary className="cursor-pointer text-muted">All sessions</summary>
            <ul className="mt-2 space-y-2">
              {sessions.items.map((s) => (
                <li key={s.id} className="card p-3">
                  <p className="font-medium">
                    {fmt(s.date)} · {s.stage} · {s.mode} · {s.overall}/100
                  </p>
                  <p className="text-muted">{s.jobSnippet}...</p>
                  <p>{s.summary}</p>
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}

      {byCategory.size > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">Practice tests</h2>
          <ul className="space-y-2 text-sm">
            {[...byCategory.entries()].map(([cat, rs]) => {
              const best = Math.max(...rs.map((r) => r.score / r.total));
              const last = rs[0];
              return (
                <li key={cat} className="flex justify-between card p-3">
                  <span>{CATEGORY_INFO[cat as Category]?.label ?? cat}</span>
                  <span className="text-muted">
                    Last {last.score}/{last.total} · best {Math.round(best * 100)}% · {rs.length} attempt
                    {rs.length === 1 ? "" : "s"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
