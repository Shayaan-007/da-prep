import { describe, expect, it } from "vitest";
import { isoWeek } from "@/lib/server/usage";

describe("isoWeek", () => {
  it("matches ISO 8601 weeks, with Monday as the first day", () => {
    expect(isoWeek(new Date("2026-10-02T12:00:00Z"))).toBe("2026-W40"); // Friday
    expect(isoWeek(new Date("2026-09-28T00:00:00Z"))).toBe("2026-W40"); // Monday
    expect(isoWeek(new Date("2026-10-04T23:59:00Z"))).toBe("2026-W40"); // Sunday
    expect(isoWeek(new Date("2026-10-05T00:00:00Z"))).toBe("2026-W41"); // next Monday
  });

  it("handles year boundaries", () => {
    expect(isoWeek(new Date("2027-01-01T00:00:00Z"))).toBe("2026-W53");
    expect(isoWeek(new Date("2024-12-30T00:00:00Z"))).toBe("2025-W01");
  });
});
