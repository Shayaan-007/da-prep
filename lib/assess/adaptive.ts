import type { Item } from "./types";

const DEFAULT_DIFFICULTY = 3;
const difficultyOf = (i: Item) => i.difficulty ?? DEFAULT_DIFFICULTY;

/**
 * Approximation of an adaptive test: step the target difficulty up after a correct answer and down after a wrong
 * one, then serve the unseen item closest to that target (ties go to the pool order). Vendors' real algorithms are
 * not public, so this only reproduces the experience of the questions getting harder or easier.
 */
export function nextTarget(current: number, wasFullyCorrect: boolean | null): number {
  if (wasFullyCorrect === null) return current;
  return Math.max(1, Math.min(5, current + (wasFullyCorrect ? 1 : -1)));
}

export function pickAdaptive(pool: Item[], seenIds: Set<string>, target: number): Item | null {
  let best: Item | null = null;
  for (const item of pool) {
    if (seenIds.has(item.id)) continue;
    if (!best || Math.abs(difficultyOf(item) - target) < Math.abs(difficultyOf(best) - target)) best = item;
  }
  return best;
}

export const START_TARGET = DEFAULT_DIFFICULTY;
