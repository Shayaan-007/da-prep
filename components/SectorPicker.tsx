"use client";

import { useSector } from "@/lib/prefs";
import type { SectorId } from "@/lib/sectors";

/** Saves this sector as the user's focus so interviews and tests can be tailored. */
export default function SectorPicker({ id }: { id: SectorId }) {
  const { sector, setSector } = useSector();
  const chosen = sector === id;
  return (
    <button
      onClick={() => setSector(chosen ? null : id)}
      aria-pressed={chosen}
      className={`btn ${chosen ? "btn-secondary" : "btn-primary"}`}
    >
      {chosen ? "✓ This is my sector" : "Make this my sector"}
    </button>
  );
}
