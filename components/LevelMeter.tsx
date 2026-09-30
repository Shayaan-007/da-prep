/** Live microphone level, so people can see the app is hearing them. */
export default function LevelMeter({ level, active }: { level: number; active: boolean }) {
  const bars = 16;
  const lit = Math.round(level * bars);
  return (
    <div
      role="meter"
      aria-label="Microphone level"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(level * 100)}
      className="flex h-8 items-end gap-1"
    >
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className={`w-2 rounded-sm transition-colors duration-75 ${
            !active ? "bg-line" : i < lit ? (i > bars * 0.8 ? "bg-coral-600" : "bg-brand-600") : "bg-brand-100"
          }`}
          style={{ height: `${30 + (i / bars) * 70}%` }}
        />
      ))}
    </div>
  );
}
