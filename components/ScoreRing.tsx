"use client";

import { useEffect, useState } from "react";

/** Circular score that counts up from 0 to `value` (out of `max`) when it mounts. */
export default function ScoreRing({
  value,
  max = 100,
  size = 128,
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  label?: string;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 800;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setShown(value * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const stroke = size / 13;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(shown / max, 1);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${value} out of ${max}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e1eef0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#0c7784"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold tracking-tight tabular-nums" style={{ fontSize: size * 0.3 }}>
          {Math.round(shown)}
        </span>
        {label && <span className="text-xs text-muted">{label}</span>}
      </div>
    </div>
  );
}
