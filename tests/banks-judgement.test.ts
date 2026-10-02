import { describe, expect, it } from "vitest";
import { SJT, buildSjt } from "@/lib/assess/banks/sjt";
import { TRAITS, TRAIT_BANK, buildTraits } from "@/lib/assess/banks/traits";
import { VERBAL_TF, VERBAL_TF_STIMULI } from "@/lib/assess/banks/verbal-tf";
import { validateItem } from "@/lib/assess/validate";

describe("verbal true/false/cannot say bank", () => {
  it("has 18 valid statements over 3 passages", () => {
    expect(VERBAL_TF).toHaveLength(18);
    expect(Object.keys(VERBAL_TF_STIMULI)).toHaveLength(3);
    for (const item of VERBAL_TF) {
      expect(validateItem(item), item.id).toEqual([]);
      expect(VERBAL_TF_STIMULI[item.stimulus!], item.id).toBeDefined();
    }
  });

  it("each passage has two of each answer", () => {
    for (const g of Object.keys(VERBAL_TF_STIMULI)) {
      const answers = VERBAL_TF.filter((i) => i.stimulus === g).map((i) => (i.kind === "tf-cannot-say" ? i.answer : -1));
      expect([0, 1, 2].map((a) => answers.filter((x) => x === a).length), g).toEqual([2, 2, 2]);
    }
  });

  it("statements are not copied verbatim from the passage", () => {
    for (const item of VERBAL_TF) {
      const stim = VERBAL_TF_STIMULI[item.stimulus!];
      if (stim.type !== "text") throw new Error("expected text");
      expect(stim.body.includes(item.prompt), item.id).toBe(false);
    }
  });
});

describe("situational judgement bank", () => {
  it("has 10 most/least, 6 rate-each and 4 ranking items, all valid", () => {
    expect(SJT.mostLeast).toHaveLength(10);
    expect(SJT.rateEach).toHaveLength(6);
    expect(SJT.rank).toHaveLength(4);
    for (const item of [...SJT.mostLeast, ...SJT.rateEach, ...SJT.rank]) expect(validateItem(item), item.id).toEqual([]);
  });

  it("every rate-each scenario uses the whole rating scale once", () => {
    for (const item of SJT.rateEach) {
      if (item.kind !== "rate-each") throw new Error("expected rate-each");
      expect([...item.ratings].sort(), item.id).toEqual([0, 1, 2, 3]);
    }
  });

  it("best answers are not always in the same position", () => {
    const positions = SJT.mostLeast.map((i) => (i.kind === "most-least" ? i.most : -1));
    expect(new Set(positions).size).toBeGreaterThan(1);
  });

  it("ranking items never show the options already in the right order", () => {
    for (const item of SJT.rank) {
      if (item.kind !== "rank") throw new Error("expected rank");
      expect(item.order, item.id).not.toEqual(item.order.map((_, k) => k));
    }
  });

  it("is deterministic", () => {
    expect(JSON.stringify(buildSjt())).toBe(JSON.stringify(SJT));
  });
});

describe("trait bank", () => {
  it("has 20 likert items and 12 forced-choice blocks, all valid", () => {
    expect(TRAIT_BANK.likert).toHaveLength(20);
    expect(TRAIT_BANK.forcedChoice).toHaveLength(12);
    for (const item of [...TRAIT_BANK.likert, ...TRAIT_BANK.forcedChoice]) expect(validateItem(item), item.id).toEqual([]);
  });

  it("every trait is measured by both formats and has a reverse-keyed item", () => {
    for (const t of TRAITS) {
      expect(TRAIT_BANK.likert.some((i) => i.kind === "likert" && i.trait === t), t).toBe(true);
      expect(TRAIT_BANK.likert.some((i) => i.kind === "likert" && i.trait === t && i.reverse), t).toBe(true);
      expect(TRAIT_BANK.forcedChoice.some((i) => i.kind === "forced-choice" && i.statements.some((s) => s.trait === t)), t).toBe(true);
    }
  });

  it("forced-choice blocks never repeat a trait within a block", () => {
    for (const item of TRAIT_BANK.forcedChoice) {
      if (item.kind !== "forced-choice") throw new Error("expected forced-choice");
      expect(new Set(item.statements.map((s) => s.trait)).size, item.id).toBe(item.statements.length);
    }
  });

  it("traits appear about equally often across forced-choice blocks", () => {
    const counts = new Map<string, number>();
    for (const item of TRAIT_BANK.forcedChoice) if (item.kind === "forced-choice") for (const s of item.statements) counts.set(s.trait, (counts.get(s.trait) ?? 0) + 1);
    expect(Math.max(...counts.values()) - Math.min(...counts.values())).toBeLessThanOrEqual(1);
  });

  it("is deterministic", () => {
    expect(JSON.stringify(buildTraits())).toBe(JSON.stringify(TRAIT_BANK));
  });
});
