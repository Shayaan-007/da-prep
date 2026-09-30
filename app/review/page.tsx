"use client";

import { useState } from "react";
import { postJson } from "@/lib/api";

type Review = {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  rewrittenOpening: string;
};

export default function ReviewPage() {
  const [kind, setKind] = useState<"statement" | "answer">("statement");
  const [text, setText] = useState("");
  const [jobAd, setJobAd] = useState("");
  const [review, setReview] = useState<Review | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setBusy(true);
    setError("");
    try {
      setReview(await postJson<Review>("/api/review", { kind, text, jobAd: jobAd || undefined }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="page-title">Statement and answer review</h1>
      <p className="text-muted">
        Get feedback on a personal statement or application form answer. Write it yourself and use the feedback to
        improve it. Employers want your own words.
      </p>
      <label className="block text-sm font-medium">
        What are you reviewing?
        <select
          className="input mt-1 !w-auto font-normal"
          value={kind}
          onChange={(e) => setKind(e.target.value as "statement" | "answer")}
        >
          <option value="statement">Personal statement</option>
          <option value="answer">Application form answer</option>
        </select>
      </label>
      <label className="block text-sm font-medium">
        Your text
        <textarea
          className="mt-1 h-48 w-full input font-normal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={6000}
        />
      </label>
      <label className="block text-sm font-medium">
        Job advert (optional, for tailoring)
        <textarea
          className="mt-1 h-28 w-full input font-normal"
          value={jobAd}
          onChange={(e) => setJobAd(e.target.value)}
          maxLength={6000}
        />
      </label>
      <p className="text-xs text-muted">Remove names, addresses and contact details first. Text is sent to an AI service.</p>
      {error && <p role="alert" className="callout bg-coral-50 text-coral-600">{error}</p>}
      <button
        onClick={run}
        disabled={busy || text.trim().length < 50}
        className="btn btn-primary"
      >
        {busy ? "Reviewing..." : "Review"}
      </button>

      {review && (
        <div className="space-y-4 border-t border-line pt-4">
          <h2 className="text-xl font-semibold">Score: {review.score}/10</h2>
          <p>{review.summary}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="card p-4">
              <h3 className="font-semibold">Strengths</h3>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {review.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </section>
            <section className="card p-4">
              <h3 className="font-semibold">To improve</h3>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {review.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </section>
          </div>
          <p className="callout bg-brand-50">
            <strong>A stronger opening:</strong> {review.rewrittenOpening}
          </p>
        </div>
      )}
    </div>
  );
}
