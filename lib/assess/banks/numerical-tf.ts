// True / false / cannot say statements about a data table, in the style of timed "scales" numerical tests.
// Each group shares one table. Statements are computed from the data; "cannot say" statements are about something
// the table does not contain (units, profit, the future), and the check confirms that the quantity really is absent.

import { rng, type Rng } from "@/lib/assess/rng";
import type { Item, Stimulus, TfAnswer } from "@/lib/assess/types";

export type NumericalTfBank = {
  items: Item[];
  stimuli: Record<string, Stimulus>;
  /** Recompute the expected answer (0 true, 1 false, 2 cannot say) from the stimulus alone. */
  checks: Record<string, (stimulus: Stimulus) => TfAnswer>;
};

const LINES = ["Home", "Garden", "Office", "Sport", "Travel", "Toys"] as const;

type Spec = { text: string; truth: TfAnswer; why: string; check: (s: Stimulus) => TfAnswer };

const rowsOf = (s: Stimulus) => {
  if (s.type !== "table") throw new Error("expected a table");
  return s.rows as [string, number, number][];
};
const lookup = (s: Stimulus, name: string) => rowsOf(s).find((r) => r[0] === name)!;
const hasColumn = (s: Stimulus, word: RegExp) => s.type === "table" && s.columns.some((c) => word.test(c));

function group(r: Rng): { stimulus: Stimulus; specs: Spec[] } {
  const names = r.shuffle(LINES).slice(0, 5);
  const rows: [string, number, number][] = names.map((n) => {
    const a = r.int(12, 60) * 10;
    return [n, a, a + r.int(-9, 16) * 10];
  });
  const stimulus: Stimulus = { type: "table", title: "Sales revenue by product line (£ thousand)", columns: ["Product line", "2024", "2025"], rows };
  const [x, y, z] = names;
  const [, x24, x25] = rows[0];
  const [, y24, y25] = rows[1];
  const tot24 = rows.reduce((s, q) => s + q[1], 0);
  const tot25 = rows.reduce((s, q) => s + q[2], 0);
  const best25 = rows.reduce((b, q) => (q[2] > b[2] ? q : b))[0];

  const pctX = Math.round(((x25 - x24) / x24) * 100);
  const claimTrue = r.next() < 0.5;
  const claimedPct = claimTrue ? pctX : pctX + r.pick([-7, -5, 6, 9]);
  const specA: Spec = {
    text:
      claimedPct === 0
        ? `${x} revenue was unchanged between 2024 and 2025 (to the nearest whole percent).`
        : `${x} revenue ${claimedPct > 0 ? "rose" : "fell"} by ${Math.abs(claimedPct)}% between 2024 and 2025 (to the nearest whole percent).`,
    truth: claimTrue ? 0 : 1,
    why: `${x}: (${x25} − ${x24}) ÷ ${x24} = ${(((x25 - x24) / x24) * 100).toFixed(1)}%, which is ${pctX}% to the nearest whole percent.`,
    check: (s) => {
      const [, a, b] = lookup(s, x);
      return Math.round(((b - a) / a) * 100) === claimedPct ? 0 : 1;
    },
  };

  const bestName = r.pick([x, y, z]);
  const specB: Spec = {
    text: `${bestName} had the highest revenue of any product line in 2025.`,
    truth: bestName === best25 ? 0 : 1,
    why: `Highest 2025 revenue: ${best25} (${Math.max(...rows.map((q) => q[2]))}).`,
    check: (s) => {
      const best = rowsOf(s).reduce((b, q) => (q[2] > b[2] ? q : b))[0];
      return best === bestName ? 0 : 1;
    },
  };

  const growth = (tot25 - tot24) / tot24;
  const thresh = r.pick([5, 8, 10]);
  const specC: Spec = {
    text: `Total revenue across all five product lines rose by more than ${thresh}% between 2024 and 2025.`,
    truth: growth * 100 > thresh ? 0 : 1,
    why: `Totals: 2024 = ${tot24}, 2025 = ${tot25}, a change of ${(growth * 100).toFixed(1)}%.`,
    check: (s) => {
      const t = rowsOf(s);
      const a = t.reduce((sum, q) => sum + q[1], 0);
      const b = t.reduce((sum, q) => sum + q[2], 0);
      return ((b - a) / a) * 100 > thresh ? 0 : 1;
    },
  };

  const specD: Spec = {
    text: `${y} revenue in 2025 was higher than ${z} revenue in 2024.`,
    truth: y25 > rows[2][1] ? 0 : 1,
    why: `${y} 2025 = ${y25}; ${z} 2024 = ${rows[2][1]}.`,
    check: (s) => (lookup(s, y)[2] > lookup(s, z)[1] ? 0 : 1),
  };

  const specE: Spec = {
    text: `${x} sold more units than ${y} in 2025.`,
    truth: 2,
    why: "The table gives revenue, not units sold, so the number of units cannot be worked out.",
    check: (s) => (hasColumn(s, /units?/i) ? 0 : 2),
  };
  const specF: Spec = {
    text: `${y} was more profitable than ${z} in 2024.`,
    truth: 2,
    why: "The table shows revenue only. There is no cost or profit data, so profitability cannot be compared.",
    check: (s) => (hasColumn(s, /profit|cost|margin/i) ? 0 : 2),
  };
  void y24;
  return { stimulus, specs: [specA, specB, specC, specD, specE, specF] };
}

export function buildNumericalTf(groups = 3): NumericalTfBank {
  const items: Item[] = [];
  const stimuli: Record<string, Stimulus> = {};
  const checks: NumericalTfBank["checks"] = {};
  for (let g = 1; g <= groups; g++) {
    const r = rng(5000 + g);
    const { stimulus, specs } = group(r);
    const stimId = `ntf-g${g}`;
    stimuli[stimId] = stimulus;
    r.shuffle(specs).forEach((spec, k) => {
      const id = `${stimId}-${k + 1}`;
      items.push({
        id,
        kind: "tf-cannot-say",
        stimulus: stimId,
        prompt: spec.text,
        answer: spec.truth,
        explanation: spec.why,
        difficulty: 3,
      });
      checks[id] = spec.check;
    });
  }
  return { items, stimuli, checks };
}

export const NUMERICAL_TF = buildNumericalTf();
