import { describe, expect, it } from "vitest";
import { describeKey, describeResponse } from "@/lib/assess/describe";
import type { Item } from "@/lib/assess/types";

const base = { prompt: "A question that is long enough.", explanation: "Because the working shows this." };
const mcq: Item = { ...base, id: "m", kind: "mcq", options: ["a", "b", "c"], answer: 1 };
const re: Item = { ...base, id: "r", kind: "rate-each", actions: ["x", "y"], ratings: [3, 0] };
const rk: Item = { ...base, id: "k", kind: "rank", options: ["a", "b", "c"], order: [2, 0, 1] };
const ml: Item = { ...base, id: "ml", kind: "most-least", options: ["a", "b", "c"], most: 0, least: 2 };

describe("answer descriptions", () => {
  it("describes the key for each format", () => {
    expect(describeKey(mcq)).toBe("b");
    expect(describeKey(re)).toBe("x (Effective)\ny (Counterproductive)");
    expect(describeKey(rk)).toBe("1. c\n2. a\n3. b");
    expect(describeKey(ml)).toContain("Most effective: a");
  });

  it("describes responses, including blanks", () => {
    expect(describeResponse(mcq, { kind: "mcq", choice: 0 })).toBe("a");
    expect(describeResponse(mcq, { kind: "mcq", choice: null })).toBe("No answer");
    expect(describeResponse(re, { kind: "rate-each", ratings: [null, 1] })).toBe("x (not rated)\ny (Ineffective)");
    expect(describeResponse(re, { kind: "rate-each", ratings: [null, null] })).toBe("No answer");
    expect(describeResponse(rk, { kind: "rank", order: null })).toBe("No answer");
    expect(describeResponse(ml, { kind: "most-least", most: 1, least: null })).toBe("Most effective: b. Least effective: none chosen.");
  });
});
