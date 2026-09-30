/** Wordmark: a small square mark and widely spaced capitals. */
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`grid h-7 w-7 place-items-center rounded-md text-[11px] font-bold ${
          light ? "bg-white text-navy" : "bg-brand-600 text-white"
        }`}
        aria-hidden
      >
        DA
      </span>
      <span className={`text-[15px] font-semibold uppercase tracking-[0.22em] ${light ? "text-white" : "text-ink"}`}>
        DA Prep
      </span>
    </span>
  );
}
