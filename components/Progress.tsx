/** Progress bar. Animates with transform (not width) so it stays cheap and smooth. */
export default function Progress({
  value,
  max = 100,
  label,
  className = "",
}: {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={`h-2 overflow-hidden rounded-full bg-brand-100 ${className}`}
    >
      <div
        className="h-full origin-left rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-transform duration-500 ease-out"
        style={{ transform: `scaleX(${pct})` }}
      />
    </div>
  );
}
