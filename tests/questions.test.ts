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
    expect(get("num-7").options[get("num-7").answer]).toBe("750g"); // 300/4*10
    expect(get("num-8").options[get("num-8").answer]).toBe("20%"); // (45000-36000)/45000
    expect(get("num-9").options[get("num-9").answer]).toBe("15"); // (12+15+9+18+21)/5
    expect(get("num-10").options[get("num-10").answer]).toBe("£36"); // 0.15*240
    expect(get("num-11").options[get("num-11").answer]).toBe("£247"); // 12*18.5+25
    expect(get("num-12").options[get("num-12").answer]).toBe("3 hours"); // 135/45
  });

  it("checks the sequences in logical answers", () => {
    const get = (id: string) => QUESTIONS.find((q) => q.id === id)!;
    const ans = (id: string) => get(id).options[get(id).answer];
    expect(ans("log-1")).toBe("42"); // differences 4,6,8,10,12
    expect(ans("log-2")).toBe("38"); // differences 3,5,7,9,11
    expect(ans("log-6")).toBe("13"); // 5+8
    expect(ans("log-7")).toBe("160"); // x2
    expect(ans("log-8")).toBe("72"); // -7
    expect(ans("log-9")).toBe("13"); // next prime
    expect(ans("log-12")).toBe("100"); // not a power of 3
  });

  it("has at least 10 questions in every category", () => {
    for (const c of Object.keys(CATEGORY_INFO) as Category[]) {
      expect(QUESTIONS.filter((q) => q.category === c).length, c).toBeGreaterThanOrEqual(10);
    }
  });
});
