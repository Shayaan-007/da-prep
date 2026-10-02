"use client";

import { useState } from "react";
import { evaluate, formatResult } from "@/lib/assess/calc";

const KEYS = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "%", "+", "(", ")", "C", "="];

/** On-screen calculator. Sections that allow one show it; the production CSP blocks third-party embeds. */
export default function Calculator() {
  // One state object updated functionally, so quick successive taps never read stale state.
  const [{ shown }, setCalc] = useState({ expr: "", shown: "0" });

  function press(k: string) {
    setCalc((s) => {
      if (k === "C") return { expr: "", shown: "0" };
      if (k === "=") {
        const r = evaluate(s.expr);
        if (r === null) return { expr: s.expr, shown: "Error" };
        const text = formatResult(r);
        return { expr: text, shown: text };
      }
      const next = s.shown === "Error" ? k : s.expr + k;
      return { expr: next, shown: next };
    });
  }

  return (
    <div className="w-60 rounded-lg border border-line bg-white p-3 shadow-sm" role="group" aria-label="Calculator">
      <output className="mb-2 block min-h-8 overflow-x-auto rounded bg-brand-50 px-2 py-1 text-right text-lg tabular-nums" aria-live="polite">
        {shown}
      </output>
      <div className="grid grid-cols-4 gap-1.5">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            className="rounded border border-line bg-white py-2 text-base font-medium hover:border-brand-500"
            aria-label={k === "÷" ? "divide" : k === "×" ? "multiply" : k === "−" ? "minus" : k === "C" ? "clear" : k === "=" ? "equals" : k === "%" ? "percent" : k}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
