import { describe, expect, it } from "vitest";
import { evaluate, formatResult } from "@/lib/assess/calc";

describe("calculator", () => {
  it("follows operator precedence and brackets", () => {
    expect(evaluate("2+3×4")).toBe(14);
    expect(evaluate("(2+3)×4")).toBe(20);
    expect(evaluate("10÷4")).toBe(2.5);
    expect(evaluate("2×(3+4)×5")).toBe(70);
  });

  it("handles percentages, decimals and unary minus", () => {
    expect(evaluate("50%")).toBe(0.5);
    expect(evaluate("200×15%")).toBe(30);
    expect(evaluate("1.5+2.25")).toBe(3.75);
    expect(evaluate("-3+5")).toBe(2);
    expect(evaluate("4×-2")).toBe(-8);
  });

  it("returns null for incomplete or invalid input", () => {
    for (const bad of ["", "2+", "(2+3", "2+3)", "1..2", ".", "2÷0", "abc", "2 3"]) expect(evaluate(bad), bad).toBeNull();
  });

  it("does not execute code", () => {
    expect(evaluate("alert(1)")).toBeNull();
    expect(evaluate("1;2")).toBeNull();
  });

  it("formats away floating-point noise", () => {
    expect(formatResult(evaluate("0.1+0.2")!)).toBe("0.3");
    expect(formatResult(1 / 3)).toBe("0.333333333333");
  });
});
