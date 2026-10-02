"use client";

import { useState } from "react";
import { evaluate, formatResult } from "@/lib/assess/calc";

const KEYS = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "%", "+", "(", ")", "C", "="];

/** On-screen calculator. Sections that allow one show it; the production CSP blocks third-party embeds. */
export default function Calculator() {
  const [expr, setExpr] = useState("");
  const [shown, setShown] = useState("0");

  function press(k: string) {
    if (k === "C") {
      setExpr("");
      setShown("0");
    } else if (k === "=") {
      const r = evaluate(expr);
      if (r === null) setShown("Error");
      else {
        const text = formatResult(r);
        setExpr(text);
        setShown(text);
      }
    } else {
      const next = shown === "Error" ? k : expr + k;
      setExpr(next);
      setShown(next);
    }
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
