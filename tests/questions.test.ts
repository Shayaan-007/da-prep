import { describe, expect, it } from "vitest";
import { CATEGORY_INFO, QUESTIONS, type Category } from "@/lib/questions";

describe("question bank", () => {
  it("has unique ids", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a valid answer index and an explanation for every question", () => {
    for (const q of QUESTIONS) {
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThan(q.options.length);
      expect(q.explanation.length, q.id).toBeGreaterThan(10);
      expect(new Set(q.options).size, q.id).toBe(q.options.length);
    }
  });

  it("covers every category", () => {
    for (const c of Object.keys(CATEGORY_INFO) as Category[]) {
      expect(QUESTIONS.filter((q) => q.category === c).length, c).toBeGreaterThanOrEqual(5);
    }
  });

  it("checks the arithmetic in numerical answers", () => {
    const get = (id: string) => QUESTIONS.find((q) => q.id === id)!;
    expect(get("num-1").options[get("num-1").answer]).toBe("15%"); // 36000/240000
    expect(get("num-2").options[get("num-2").answer]).toBe("£400"); // 640/8*5
    expect(get("num-3").options[get("num-3").answer]).toBe("72 km/h"); // 180/2.5
    expect(get("num-4").options[get("num-4").answer]).toBe("£100"); // 80/0.8
    expect(get("num-5").options[get("num-5").answer]).toBe("£87.50"); // 62 + 25.5
    expect(get("num-6").options[get("num-6").answer]).toBe("€290"); // 250*1.16
  });
});
