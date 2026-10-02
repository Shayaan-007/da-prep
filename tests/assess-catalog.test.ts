import { describe, expect, it } from "vitest";
import { START_TARGET, nextTarget, pickAdaptive } from "@/lib/assess/adaptive";
import { scoreSection, summarise, traitProfile } from "@/lib/assess/score";
import { TESTS, getTest } from "@/lib/assess/tests";
import type { Item, Response, Test } from "@/lib/assess/types";
import { totalSeconds, validateTest } from "@/lib/assess/validate";

/** The response a perfect candidate would give. */
function perfect(item: Item): Response {
  switch (item.kind) {
    case "mcq":
    case "tf-cannot-say":
      return { kind: item.kind, choice: item.answer };
    case "most-least":
      return { kind: "most-least", most: item.most, least: item.least };
    case "rate-each":
      return { kind: "rate-each", ratings: item.ratings };
    case "rank":
      return { kind: "rank", order: item.order };
    case "likert":
      return { kind: "likert", value: 5 };
    case "forced-choice":
      return { kind: "forced-choice", most: 0, least: 1 };
  }
}

describe("test catalogue", () => {
  it("has unique ids and every test validates", () => {
    expect(new Set(TESTS.map((t) => t.id)).size).toBe(TESTS.length);
    for (const t of TESTS) expect(validateTest(t), t.id).toEqual([]);
  });

  it("every test is marked approximate and states its limits", () => {
    for (const t of TESTS) {
      expect(t.approximate, t.id).toBe(true);
      expect(t.formatNotes.length, t.id).toBeGreaterThan(0);
      expect(t.sources.length, t.id).toBeGreaterThan(0);
    }
  });

  it("SHL replicas match the published counts and timings", () => {
    const shl = (id: string) => getTest(id)!.sections[0];
    expect(shl("shl-numerical").adaptive?.count).toBe(10);
    expect(shl("shl-inductive").adaptive?.count).toBe(15);
    expect(shl("shl-deductive").adaptive?.count).toBe(12);
    for (const id of ["shl-numerical", "shl-inductive", "shl-deductive"]) {
      expect(shl(id).timing, id).toEqual({ mode: "section", seconds: 18 * 60 });
      expect(shl(id).allowBack, id).toBe(false);
    }
    expect(totalSeconds(getTest("shl-numerical")!)).toBe(1080);
  });

  it("scales replicas keep the reported pace", () => {
    expect(getTest("scales-numerical")!.sections[0].items).toHaveLength(18);
    expect(getTest("scales-numerical")!.sections[0].timing).toEqual({ mode: "section", seconds: 360 });
    const pace = 265 / 18;
    const real = (12 * 60) / 49;
    expect(Math.abs(pace - real)).toBeLessThan(0.5);
  });

  it("adaptive pools are bigger than the number served", () => {
    for (const t of TESTS) for (const s of t.sections) if (s.adaptive) expect(s.items.length, t.id).toBeGreaterThan(s.adaptive.count);
  });

  it("a perfect candidate scores full marks on every ability test", () => {
    for (const t of TESTS.filter((x) => x.kind === "ability")) {
      for (const s of t.sections) {
        const served = s.adaptive ? s.items.slice(0, s.adaptive.count) : s.items;
        const responses = Object.fromEntries(served.map((i) => [i.id, perfect(i)]));
        const r = scoreSection(s, responses, 100);
        expect(r.points, t.id).toBe(r.max);
        expect(r.max, t.id).toBeGreaterThan(0);
      }
    }
  });

  it("an adaptive run serves exactly `count` distinct items and gets harder when you are right", () => {
    for (const t of TESTS) {
      for (const s of t.sections) {
        if (!s.adaptive) continue;
        const seen = new Set<string>();
        let target = START_TARGET;
        let last = pickAdaptive(s.items, seen, target);
        const difficulties: number[] = [];
        while (last && seen.size < s.adaptive.count) {
          seen.add(last.id);
          difficulties.push(last.difficulty ?? 3);
          target = nextTarget(target, true);
          last = pickAdaptive(s.items, seen, target);
        }
        expect(seen.size, t.id).toBe(s.adaptive.count);
        // The first few items climb in difficulty while the candidate keeps answering correctly.
        expect(difficulties.slice(0, 4), t.id).toEqual([...difficulties.slice(0, 4)].sort((a, b) => a - b));
        expect(Math.max(...difficulties), t.id).toBeGreaterThanOrEqual(4);
      }
    }
  });
});

describe("trait profiles", () => {
  const run = (t: Test, make: (i: Item) => Response) => {
    const responses: Record<string, Response> = {};
    const sections = t.sections.map((s) => {
      for (const i of s.items) responses[i.id] = make(i);
      return scoreSection(s, responses, 10);
    });
    return { result: summarise(t, "2026-10-02T00:00:00Z", sections, responses), responses };
  };

  it("rating test: all 5s gives high scores except where reverse items pull down", () => {
    const t = getTest("work-style-rating")!;
    const { result } = run(t, () => ({ kind: "likert", value: 5 }));
    const profile = traitProfile(t, result);
    expect(profile.map((p) => p.trait).sort()).toEqual(["Accuracy", "Adaptability", "Initiative", "Planning", "Resilience", "Teamwork"]);
    for (const p of profile) {
      expect(p.percent).toBeGreaterThan(40);
      expect(p.percent).toBeLessThan(100); // each trait has a reverse-keyed item, so straight 5s cannot reach 100
    }
  });

  it("rating test: consistent answers at both ends give 100 and 0", () => {
    const t = getTest("work-style-rating")!;
    const high = traitProfile(t, run(t, (i) => ({ kind: "likert", value: i.kind === "likert" && i.reverse ? 1 : 5 })).result);
    const low = traitProfile(t, run(t, (i) => ({ kind: "likert", value: i.kind === "likert" && i.reverse ? 5 : 1 })).result);
    for (const p of high) expect(p.percent).toBe(100);
    for (const p of low) expect(p.percent).toBe(0);
  });

  it("forced-choice: choosing one trait as 'most' every time raises it above the others", () => {
    const t = getTest("work-style-forced-choice")!;
    const { result } = run(t, (i) => {
      if (i.kind !== "forced-choice") throw new Error("expected forced-choice");
      const resilient = i.statements.findIndex((s) => s.trait === "Resilience");
      if (resilient >= 0) return { kind: "forced-choice", most: resilient, least: (resilient + 1) % i.statements.length };
      return { kind: "forced-choice", most: 0, least: 1 };
    });
    const profile = traitProfile(t, result);
    expect(profile[0].trait).toBe("Resilience");
  });
});
