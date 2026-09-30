"use client";

import { useEffect, useState } from "react";

/** Circular score that animates from 0 to `value` (out of `max`) when it mounts. */
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
    const duration = 1100;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const stroke = size / 11;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(shown / max, 1);
  const id = `ring-${size}`;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${value} out of ${max}`}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0e9aa7" />
            <stop offset="55%" stopColor="#2f80ed" />
            <stop offset="100%" stopColor="#ff8a3d" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e3f1f3" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="display font-extrabold tracking-tight" style={{ fontSize: size * 0.28 }}>
          {Math.round(shown)}
        </span>
        {label && <span className="text-xs text-muted">{label}</span>}
      </div>
    </div>
  );
}
