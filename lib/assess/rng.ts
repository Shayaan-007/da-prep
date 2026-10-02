/** Small seeded generator (mulberry32) so generated banks are identical on every build and test run. */
export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    /** Integer in [min, max]. */
    int: (min: number, max: number) => min + Math.floor(next() * (max - min + 1)),
    pick: <T,>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    shuffle: <T,>(arr: readonly T[]): T[] => {
      const b = [...arr];
      for (let i = b.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [b[i], b[j]] = [b[j], b[i]];
      }
      return b;
    },
  };
}

export type Rng = ReturnType<typeof rng>;

/**
 * Build a 5-option multiple choice: the correct text plus distractors (de-duplicated, never equal to the key),
 * shuffled. Throws if there are not enough distinct distractors, so a bad template fails loudly at build time.
 */
export function mcqOptions(r: Rng, correct: string, distractors: string[], count = 5): { options: string[]; answer: number } {
  const uniq = [...new Set(distractors.filter((d) => d !== correct))];
  if (uniq.length < count - 1) throw new Error(`Not enough distinct distractors for ${correct}: ${distractors.join(", ")}`);
  const options = r.shuffle([correct, ...uniq.slice(0, count - 1)]);
  return { options, answer: options.indexOf(correct) };
}
