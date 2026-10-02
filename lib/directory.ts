import { EMPLOYERS, type Employer } from "@/lib/employers";
import { FIRMS } from "@/lib/firms";
import type { SectorId } from "@/lib/sectors";

/** One row in the employer directory: the seed list merged with researched firm profiles. */
export type DirectoryEntry = Employer & { slug?: string };

const firstWord = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)[0];

const SECTOR_RULES: [RegExp, SectorId[]][] = [
  [/bank|financ|account|audit|insur|advis/i, ["finance"]],
  [/aero|defen[cs]e|automotive|engineer/i, ["engineering"]],
  [/tech|digital|software|cloud|retail/i, ["digital"]],
  [/police|government|civil service|public|protective/i, ["public"]],
  [/construction|infrastructure/i, ["construction"]],
];
const sectorsFor = (text: string): SectorId[] => {
  const found = SECTOR_RULES.filter(([re]) => re.test(text)).flatMap(([, ids]) => ids);
  return found.length ? [...new Set(found)] : ["business"];
};

// Profiles that stay reachable by URL but should not be advertised as a current opportunity.
const HIDDEN = new Set(["civil-service-fast-track"]);
const NOTES: Record<string, string> = {
  google: "Check for a live UK degree apprenticeship listing; none was confirmed when researched.",
};

export function directory(): DirectoryEntry[] {
  const used = new Set<string>();
  const merged: DirectoryEntry[] = EMPLOYERS.map((e) => {
    const firm = FIRMS.find((f) => !HIDDEN.has(f.slug) && firstWord(f.name) === firstWord(e.name));
    if (firm) used.add(firm.slug);
    return firm ? { ...e, slug: firm.slug } : e;
  });
  for (const f of FIRMS) {
    if (used.has(f.slug) || HIDDEN.has(f.slug)) continue;
    merged.push({ name: f.name, sector: f.sector, sectors: sectorsFor(f.sector), slug: f.slug, note: NOTES[f.slug] });
  }
  return merged.sort((a, b) => a.name.localeCompare(b.name));
}
