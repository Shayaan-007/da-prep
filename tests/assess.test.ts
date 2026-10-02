import { describe, expect, it } from "vitest";
import { nextTarget, pickAdaptive } from "@/lib/assess/adaptive";
import { blankResponse, percent, rankConcordance, scoreItem, scoreSection, summarise } from "@/lib/assess/score";
import type { Item, Response, Section, Test } from "@/lib/assess/types";
import { totalSeconds, validateItem, validateSection, validateTest } from "@/lib/assess/validate";

const base = { prompt: "A question that is long enough.", explanation: "Because the working shows this." };

const mcq: Item = { ...base, id: "m1", kind: "mcq", options: ["a", "b", "c"], answer: 1 };
const tf: Item = { ...base, id: "t1", kind: "tf-cannot-say", answer: 2 };
const ml: Item = { ...base, id: "ml1", kind: "most-least", options: ["a", "b", "c", "d"], most: 0, least: 3 };
const re: Item = { ...base, id: "re1", kind: "rate-each", actions: ["a", "b", "c", "d"], ratings: [3, 2, 1, 0] };
const rk: Item = { ...base, id: "rk1", kind: "rank", options: ["a", "b", "c", "d"], order: [2, 0, 3, 1] };
const lk: Item = { ...base, id: "lk1", kind: "likert", trait: "Resilience" };
const lkr: Item = { ...base, id: "lk2", kind: "likert", trait: "Resilience", reverse: true };
const fc: Item = {
  ...base,
  id: "fc1",
  kind: "forced-choice",
  statements: [
    { text: "I plan ahead", trait: "Planning" },
    { text: "I adapt quickly", trait: "Adaptability" },
    { text: "I stay calm", trait: "Resilience" },
  ],
};

describe("scoreItem", () => {
  it("marks single-answer items", () => {
    expect(scoreItem(mcq, { kind: "mcq", choice: 1 })).toMatchObject({ points: 1, max: 1, answered: true });
    expect(scoreItem(mcq, { kind: "mcq", choice: 0 }).points).toBe(0);
    expect(scoreItem(mcq, { kind: "mcq", choice: null })).toMatchObject({ points: 0, answered: false });
    expect(scoreItem(tf, { kind: "tf-cannot-say", choice: 2 }).points).toBe(1);
  });

  it("gives partial credit on most/least", () => {
    expect(scoreItem(ml, { kind: "most-least", most: 0, least: 3 }).points).toBe(2);
    expect(scoreItem(ml, { kind: "most-least", most: 0, least: 1 }).points).toBe(1);
    expect(scoreItem(ml, { kind: "most-least", most: 1, least: 0 }).points).toBe(0);
  });

  it("rate-each: full for exact, half for one step away", () => {
    expect(scoreItem(re, { kind: "rate-each", ratings: [3, 2, 1, 0] })).toMatchObject({ points: 4, max: 4 });
    expect(scoreItem(re, { kind: "rate-each", ratings: [2, 2, 1, 0] }).points).toBe(3.5);
    expect(scoreItem(re, { kind: "rate-each", ratings: [0, 2, 1, 0] }).points).toBe(3);
    expect(scoreItem(re, { kind: "rate-each", ratings: [null, null, null, null] })).toMatchObject({ points: 0, answered: false });
  });

  it("rank: concordance of pairs", () => {
    expect(rankConcordance([2, 0, 3, 1], [2, 0, 3, 1])).toBe(1);
    expect(rankConcordance([2, 0, 3, 1], [1, 3, 0, 2])).toBe(0);
    expect(scoreItem(rk, { kind: "rank", order: [2, 0, 3, 1] }).points).toBe(1);
    expect(scoreItem(rk, { kind: "rank", order: [0, 2, 3, 1] }).points).toBeCloseTo(5 / 6);
    expect(scoreItem(rk, { kind: "rank", order: null }).points).toBe(0);
  });

  it("trait items produce trait scores and no marks", () => {
    expect(scoreItem(lk, { kind: "likert", value: 4 })).toMatchObject({ max: 0, traits: { Resilience: 4 } });
    expect(scoreItem(lkr, { kind: "likert", value: 4 }).traits).toEqual({ Resilience: 2 });
    expect(scoreItem(fc, { kind: "forced-choice", most: 0, least: 2 }).traits).toEqual({ Planning: 1, Resilience: -1 });
  });

  it("rejects a response of the wrong kind", () => {
    expect(() => scoreItem(mcq, { kind: "likert", value: 1 })).toThrow();
  });

  it("blankResponse matches every item kind", () => {
    for (const item of [mcq, tf, ml, re, rk, lk, fc]) {
      expect(blankResponse(item).kind).toBe(item.kind);
      expect(() => scoreItem(item, blankResponse(item))).not.toThrow();
    }
  });
});

describe("scoreSection and summarise", () => {
  const section: Section = {
    id: "s1",
    title: "S",
    instructions: "Do it.",
    items: [mcq, ml],
    timing: { mode: "section", seconds: 60 },
    allowBack: true,
    calculator: false,
    showFeedback: false,
  };

  it("counts unreached items towards the maximum", () => {
    const r = scoreSection(section, { m1: { kind: "mcq", choice: 1 } }, 30);
    expect(r).toMatchObject({ points: 1, max: 3, answered: 1, total: 2, secondsUsed: 30 });
  });

  it("combines sections and traits", () => {
    const test = { id: "t" } as Test;
    const a = scoreSection({ ...section, items: [lk] }, { lk1: { kind: "likert", value: 5 } as Response }, 5);
    const b = scoreSection({ ...section, items: [lk] }, { lk1: { kind: "likert", value: 3 } as Response }, 5);
    expect(summarise(test, "2026-10-02T00:00:00Z", [a, b], {}).traits).toEqual({ Resilience: 8 });
  });

  it("percent returns null when nothing is marked", () => {
    expect(percent(0, 0)).toBeNull();
    expect(percent(3, 4)).toBe(75);
  });
});

describe("adaptive selection", () => {
  const pool = ([1, 2, 3, 4, 5] as const).map((d) => ({ ...mcq, id: `d${d}`, difficulty: d })) as Item[];

  it("steps the target and clamps it", () => {
    expect(nextTarget(3, true)).toBe(4);
    expect(nextTarget(3, false)).toBe(2);
    expect(nextTarget(5, true)).toBe(5);
    expect(nextTarget(1, false)).toBe(1);
    expect(nextTarget(3, null)).toBe(3);
  });

  it("serves the unseen item closest to the target and never repeats", () => {
    expect(pickAdaptive(pool, new Set(), 4)?.id).toBe("d4");
    expect(pickAdaptive(pool, new Set(["d4"]), 4)?.id).toBe("d3");
    expect(pickAdaptive(pool, new Set(pool.map((p) => p.id)), 3)).toBeNull();
  });
});

describe("validation", () => {
  it("accepts well-formed items", () => {
    for (const item of [mcq, tf, ml, re, rk, lk, fc]) expect(validateItem(item), item.id).toEqual([]);
  });

  it("catches malformed items", () => {
    expect(validateItem({ ...mcq, answer: 9 } as Item)).not.toEqual([]);
    expect(validateItem({ ...mcq, options: ["a", "a", "b"] } as Item)).not.toEqual([]);
    expect(validateItem({ ...ml, most: 1, least: 1 } as Item)).not.toEqual([]);
    expect(validateItem({ ...re, ratings: [3, 2] } as Item)).not.toEqual([]);
    expect(validateItem({ ...re, ratings: [3, 2, 1, 5] } as Item)).not.toEqual([]);
    expect(validateItem({ ...rk, order: [0, 0, 1, 2] } as Item)).not.toEqual([]);
    expect(validateItem({ ...fc, statements: fc.kind === "forced-choice" ? fc.statements.slice(0, 2) : [] } as Item)).not.toEqual([]);
  });

  const section: Section = {
    id: "s",
    title: "S",
    instructions: "x",
    items: [{ ...mcq, stimulus: "missing" }],
    timing: { mode: "section", seconds: 60 },
    allowBack: true,
    calculator: false,
    showFeedback: false,
  };

  it("checks stimulus references, chart and table shape, and timing", () => {
    expect(validateSection(section).join()).toContain("unknown stimulus");
    const bad: Section = {
      ...section,
      items: [mcq],
      stimuli: {
        c: { type: "chart", kind: "bar", labels: ["a", "b"], series: [{ name: "s", values: [1] }] },
        t: { type: "table", columns: ["a", "b"], rows: [[1]] },
      },
      timing: { mode: "section", seconds: 0 },
    };
    const problems = validateSection(bad).join();
    expect(problems).toContain("series");
    expect(problems).toContain("cells");
    expect(problems).toContain("timing");
  });

  it("adaptive sections cannot allow going back and need a valid count", () => {
    const s: Section = { ...section, items: [mcq, tf], adaptive: { count: 3 }, allowBack: true };
    const problems = validateSection(s).join();
    expect(problems).toContain("adaptive count");
    expect(problems).toContain("cannot allow going back");
  });

  it("separates ability and trait tests", () => {
    const test: Test = {
      id: "t",
      name: "T",
      replicates: "x",
      kind: "ability",
      sections: [{ ...section, items: [lk] }],
      confidence: "inferred",
      approximate: true,
      formatNotes: [],
      sources: ["https://example.com"],
    };
    expect(validateTest(test).join()).toContain("trait item in an ability test");
  });

  it("totals declared working time", () => {
    const t = {
      sections: [
        { ...section, items: [mcq, tf], timing: { mode: "section", seconds: 600 } },
        { ...section, items: [mcq, tf, ml], timing: { mode: "item", seconds: 30 } },
        { ...section, items: [mcq], timing: { mode: "untimed" } },
      ],
    } as unknown as Test;
    expect(totalSeconds(t)).toBe(600 + 90);
  });
});
