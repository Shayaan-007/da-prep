import { describe, expect, it } from "vitest";
import { EMPLOYERS } from "@/lib/employers";
import { nextInput, nextQuestionSystem } from "@/lib/interview";
import { CATEGORY_INFO } from "@/lib/questions";
import { SECTOR_BY_ID, SECTOR_IDS, SECTORS } from "@/lib/sectors";

describe("sector packs", () => {
  it("has one complete pack per id", () => {
    expect(SECTORS.map((s) => s.id).sort()).toEqual([...SECTOR_IDS].sort());
    for (const s of SECTORS) {
      expect(s.examples.length, s.id).toBeGreaterThan(0);
      expect(s.differs.length, s.id).toBeGreaterThan(0);
      expect(s.promptHint.length, s.id).toBeGreaterThan(20);
      expect(s.sampleAd.length, s.id).toBeGreaterThan(100);
      for (const t of s.tests) expect(CATEGORY_INFO[t], `${s.id}:${t}`).toBeDefined();
    }
  });

  it("sample adverts pass the interview input schema", () => {
    for (const s of SECTORS) {
      const r = nextInput.safeParse({ jobAd: s.sampleAd, stage: "motivation", sector: s.id, history: [] });
      expect(r.success, s.id).toBe(true);
    }
  });

  it("employers only reference real sectors", () => {
    for (const e of EMPLOYERS) {
      expect(e.sectors.length, e.name).toBeGreaterThan(0);
      for (const id of e.sectors) expect(SECTOR_BY_ID[id], `${e.name}:${id}`).toBeDefined();
    }
  });
});

describe("sector-aware prompts", () => {
  it("adds sector context only when a sector is given", () => {
    expect(nextQuestionSystem("motivation")).not.toContain("Sector:");
    const p = nextQuestionSystem("competency", "law");
    expect(p).toContain("Sector: Law");
    expect(p).toContain(SECTOR_BY_ID.law.promptHint);
  });

  it("rejects unknown sectors", () => {
    const r = nextInput.safeParse({ jobAd: SECTORS[0].sampleAd, stage: "motivation", sector: "astrology", history: [] });
    expect(r.success).toBe(false);
  });
});
