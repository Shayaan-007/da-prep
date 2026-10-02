// Original deductive reasoning items: scheduling puzzles. Five tasks go on five different weekdays, a set of
// constraints is given, and the candidate works out which day one task falls on. Each puzzle is generated from a hidden
// valid week and constraints are added until every valid arrangement agrees on the answer, so the key is provable
// (tests re-solve each puzzle by brute force over all 120 arrangements).

import { rng, type Rng } from "@/lib/assess/rng";
import type { Item } from "@/lib/assess/types";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

const TASK_SETS: string[][] = [
  ["the stock check", "the safety audit", "the client call", "the team briefing", "the payroll run"],
  ["the delivery run", "the maintenance visit", "the training session", "the inspection", "the budget review"],
  ["the product demo", "the supplier meeting", "the data backup", "the site tour", "the quality review"],
  ["the fire drill", "the stock take", "the apprentice review", "the customer survey", "the equipment check"],
];

/** pos[i] is the weekday index (0-4) of task i. */
export type Constraint = { text: string; test: (pos: number[]) => boolean };
export type DeductiveMeta = { constraints: Constraint[]; target: number; tasks: string[] };

function allPermutations(n: number): number[][] {
  const out: number[][] = [];
  const rec = (cur: number[], rest: number[]) => {
    if (!rest.length) return void out.push(cur);
    rest.forEach((v, i) => rec([...cur, v], [...rest.slice(0, i), ...rest.slice(i + 1)]));
  };
  rec([], Array.from({ length: n }, (_, i) => i));
  return out;
}
const PERMS = allPermutations(5);

export const validArrangements = (constraints: Constraint[]) => PERMS.filter((p) => constraints.every((c) => c.test(p)));

function candidateConstraint(r: Rng, sol: number[], tasks: string[], usedOnDay: boolean): Constraint | null {
  const a = r.int(0, 4);
  let b = r.int(0, 4);
  while (b === a) b = r.int(0, 4);
  const T = (i: number) => tasks[i];
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  const kind = r.pick(["before", "before", "notDay", "notDay", "immediately", "notAdjacent", "onDay"] as const);
  if (kind === "before" && sol[a] < sol[b]) return { text: `${cap(T(a))} is earlier in the week than ${T(b)}.`, test: (p) => p[a] < p[b] };
  if (kind === "notDay") {
    const d = r.int(0, 4);
    if (sol[a] !== d) return { text: `${cap(T(a))} is not on ${DAYS[d]}.`, test: (p) => p[a] !== d };
  }
  if (kind === "immediately" && sol[b] === sol[a] + 1) return { text: `${cap(T(b))} is the day immediately after ${T(a)}.`, test: (p) => p[b] === p[a] + 1 };
  if (kind === "notAdjacent" && Math.abs(sol[a] - sol[b]) > 1) return { text: `${cap(T(a))} and ${T(b)} are not on consecutive days.`, test: (p) => Math.abs(p[a] - p[b]) > 1 };
  if (kind === "onDay" && !usedOnDay) return { text: `${cap(T(a))} is on ${DAYS[sol[a]]}.`, test: (p) => p[a] === sol[a] };
  return null;
}

export type DeductiveBank = { items: Item[]; meta: Record<string, DeductiveMeta> };

export function buildDeductive(count = 16): DeductiveBank {
  const items: Item[] = [];
  const meta: Record<string, DeductiveMeta> = {};
  let seed = 20000;
  while (items.length < count) {
    seed++;
    const r = rng(seed);
    const tasks = TASK_SETS[items.length % TASK_SETS.length];
    const sol = r.shuffle([0, 1, 2, 3, 4]);
    const target = r.int(0, 4);
    const constraints: Constraint[] = [];
    let usedOnDay = false;
    for (let guard = 0; guard < 200 && constraints.length < 7; guard++) {
      const c = candidateConstraint(r, sol, tasks, usedOnDay);
      if (!c) continue;
      if (c.text.includes(" is on ")) usedOnDay = true;
      constraints.push(c);
      const days = new Set(validArrangements(constraints).map((p) => p[target]));
      if (days.size === 1 && constraints.length >= 3) break;
    }
    const days = new Set(validArrangements(constraints).map((p) => p[target]));
    if (days.size !== 1 || constraints.length < 3) continue; // retry with another seed
    const answer = [...days][0];
    const id = `ded-${items.length + 1}`;
    const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
    items.push({
      id,
      kind: "mcq",
      prompt:
        `Five tasks are each scheduled on a different day, Monday to Friday: ${tasks.join(", ")}.\n\n` +
        `${constraints.map((c, i) => `${i + 1}. ${c.text}`).join("\n")}\n\n` +
        `On which day is ${tasks[target]} scheduled?`,
      options: [...DAYS],
      answer,
      explanation: `Combine the rules: only arrangements where all ${constraints.length} statements hold are possible, and in every one of them ${tasks[target]} falls on ${DAYS[answer]}. ${cap(tasks[target])} cannot be on any other day.`,
      difficulty: (constraints.length <= 3 ? 2 : constraints.length === 4 ? 3 : constraints.length === 5 ? 4 : 5) as 2 | 3 | 4 | 5,
    });
    meta[id] = { constraints, target, tasks };
  }
  return { items, meta };
}

export const DEDUCTIVE = buildDeductive();
