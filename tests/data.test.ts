import { describe, expect, it } from "vitest";
import { applyBackup, buildBackup } from "@/lib/backup";
import { applicationsToIcs, hasDeadlines } from "@/lib/ics";
import type { Application } from "@/lib/types";

const app = (over: Partial<Application> = {}): Application => ({
  id: "a1",
  employer: "Rolls-Royce",
  role: "Engineering, Level 6",
  deadline: "2026-11-30",
  status: "Interested",
  notes: "",
  ...over,
});

describe("calendar export", () => {
  const ics = applicationsToIcs([app(), app({ id: "a2", deadline: "" })], new Date("2026-10-01T09:30:00Z"));

  it("creates one all-day event per dated application", () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261130");
    expect(ics).toContain("DTEND;VALUE=DATE:20261201");
    expect(ics).toContain("DTSTAMP:20261001T093000Z");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("escapes commas in text fields", () => {
    expect(ics).toContain("SUMMARY:Closes: Rolls-Royce (Engineering\\, Level 6)");
  });

  it("rolls month and year ends over correctly", () => {
    expect(applicationsToIcs([app({ deadline: "2026-12-31" })])).toContain("DTEND;VALUE=DATE:20270101");
    expect(applicationsToIcs([app({ deadline: "2028-02-28" })])).toContain("DTEND;VALUE=DATE:20280229");
  });

  it("detects whether there is anything to export", () => {
    expect(hasDeadlines([app({ deadline: "" })])).toBe(false);
    expect(hasDeadlines([app()])).toBe(true);
  });
});

function memoryStorage(initial: Record<string, string> = {}) {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    dump: () => Object.fromEntries(m),
  };
}

describe("backup and restore", () => {
  it("round-trips data between two browsers", () => {
    const a = memoryStorage({
      "da-prep:applications": JSON.stringify([app()]),
      "da-prep:stories": JSON.stringify([{ id: "s1", title: "Robotics" }]),
      "da-prep:sector": "engineering",
    });
    const backup = buildBackup(a, new Date("2026-10-01T00:00:00Z"));
    expect(backup.version).toBe(1);
    expect(backup.sector).toBe("engineering");

    const b = memoryStorage();
    expect(applyBackup(b, JSON.parse(JSON.stringify(backup)))).toBe(2);
    expect(JSON.parse(b.getItem("da-prep:applications")!)).toHaveLength(1);
    expect(b.getItem("da-prep:sector")).toBe("engineering");
  });

  it("never overwrites or duplicates existing items", () => {
    const b = memoryStorage({ "da-prep:applications": JSON.stringify([app({ notes: "mine" })]) });
    const incoming = { app: "da-prep", version: 1, data: { applications: [app({ notes: "theirs" }), app({ id: "a9" })] } };
    expect(applyBackup(b, incoming)).toBe(1);
    const list = JSON.parse(b.getItem("da-prep:applications")!);
    expect(list).toHaveLength(2);
    expect(list.find((x: Application) => x.id === "a1").notes).toBe("mine");
  });

  it("rejects files that are not DA Prep backups", () => {
    expect(() => applyBackup(memoryStorage(), { hello: "world" })).toThrow(/backup/);
    expect(() => applyBackup(memoryStorage(), null)).toThrow(/backup/);
  });
});
