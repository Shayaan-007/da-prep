// Export and import of everything the app stores in the browser.

export const COLLECTIONS = ["applications", "stories", "sessions", "practice", "mocks"] as const;
const VERSION = 1;

type Backup = {
  app: "da-prep";
  version: number;
  exportedAt: string;
  sector?: string;
  data: Partial<Record<(typeof COLLECTIONS)[number], unknown[]>>;
};

export function buildBackup(storage: Pick<Storage, "getItem">, now = new Date()): Backup {
  const data: Backup["data"] = {};
  for (const name of COLLECTIONS) {
    try {
      const raw = storage.getItem(`da-prep:${name}`);
      data[name] = raw ? (JSON.parse(raw) as unknown[]) : [];
    } catch {
      data[name] = [];
    }
  }
  return {
    app: "da-prep",
    version: VERSION,
    exportedAt: now.toISOString(),
    sector: storage.getItem("da-prep:sector") ?? undefined,
    data,
  };
}

/**
 * Merge a backup into storage. Items are matched by id; existing items win, so importing is never destructive.
 * Returns how many new items were added, or throws if the file isn't a Level6 backup.
 */
export function applyBackup(storage: Pick<Storage, "getItem" | "setItem">, json: unknown): number {
  const b = json as Partial<Backup> | null;
  if (!b || b.app !== "da-prep" || typeof b.data !== "object" || b.data === null) {
    throw new Error("This doesn't look like a Level6 backup file.");
  }
  let added = 0;
  for (const name of COLLECTIONS) {
    const incoming = b.data[name];
    if (!Array.isArray(incoming)) continue;
    const key = `da-prep:${name}`;
    let existing: { id?: string }[] = [];
    try {
      existing = JSON.parse(storage.getItem(key) ?? "[]");
    } catch {}
    const ids = new Set(existing.map((x) => x.id));
    const fresh = (incoming as { id?: string }[]).filter((x) => x && typeof x.id === "string" && !ids.has(x.id));
    if (fresh.length) {
      storage.setItem(key, JSON.stringify([...existing, ...fresh]));
      added += fresh.length;
    }
  }
  if (b.sector && !storage.getItem("da-prep:sector")) storage.setItem("da-prep:sector", b.sector);
  return added;
}
