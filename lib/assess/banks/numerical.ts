// Original numerical reasoning items in the style of workplace data questions (tables, charts, percentages, ratios,
// conversions). Every answer is computed from the stimulus data by the template, and `NUMERICAL_CHECKS` recomputes
// it independently from the stimulus attached to the item so tests can prove each key.

import { mcqOptions, rng, type Rng } from "@/lib/assess/rng";
import type { Item, Stimulus } from "@/lib/assess/types";

export type NumericalBank = {
  items: Item[];
  stimuli: Record<string, Stimulus>;
  /** Recompute the correct option text for an item from its stimulus alone. */
  checks: Record<string, (stimulus: Stimulus) => string>;
};

const gbp = (n: number) => `£${n.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })}`;
const pct = (n: number, dp = 0) => `${n.toFixed(dp)}%`;
const clampDiff = (n: number): 1 | 2 | 3 | 4 | 5 => Math.max(1, Math.min(5, n)) as 1 | 2 | 3 | 4 | 5;

const REGIONS = ["North", "South", "East", "West", "Central", "Scotland"] as const;
const PRODUCTS = ["Widget A", "Widget B", "Widget C", "Widget D", "Widget E"] as const;
const DEPTS = ["Operations", "Finance", "Engineering", "Sales", "Support", "HR"] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] as const;

type Gen = (r: Rng, n: number) => { item: Omit<Item, "id"> & { kind: "mcq" }; stimulus: Stimulus; check: (s: Stimulus) => string };

// Table helpers: read numbers back out of a stimulus for the independent checks.
const table = (s: Stimulus) => {
  if (s.type !== "table") throw new Error("expected a table");
  return s;
};
const chart = (s: Stimulus) => {
  if (s.type !== "chart") throw new Error("expected a chart");
  return s;
};

/** Percentage change in one region's revenue between two quarters. */
const growth: Gen = (r, n) => {
  const regions = r.shuffle(REGIONS).slice(0, 3);
  const rows = regions.map((name) => {
    const base = r.int(20, 90) * 10;
    return [name, ...[0, 1, 2, 3].map(() => base + r.int(-6, 14) * 10)];
  });
  const target = r.int(0, 2);
  const [qa, qb] = r.pick([[1, 3], [1, 4], [2, 4], [2, 3]] as const);
  const stimulus: Stimulus = { type: "table", title: "Quarterly revenue (£ thousand)", columns: ["Region", "Q1", "Q2", "Q3", "Q4"], rows };
  const name = regions[target];
  const a = rows[target][qa] as number;
  // Make sure the two quarters differ enough for a meaningful, distinct answer.
  if (Math.abs(((rows[target][qb] as number) - a) / a) < 0.05) rows[target][qb] = a + (r.next() < 0.5 ? -1 : 1) * r.int(4, 9) * 10;
  const b = rows[target][qb] as number;
  const correct = Math.round(((b - a) / a) * 100);
  const sign = (v: number) => `${v}%`;
  const { options, answer } = mcqOptions(r, sign(correct), [
    sign(b - a), // raw difference mistaken for a percentage
    sign(Math.round(((b - a) / b) * 100)), // wrong base
    sign(-correct),
    sign(Math.round((b / a) * 100)), // ratio as a percentage
    sign(correct + 5),
    sign(correct - 4),
  ]);
  return {
    item: {
      kind: "mcq",
      prompt: `By what percentage did ${name} revenue change between Q${qa} and Q${qb}? Give your answer to the nearest whole percent.`,
      options,
      answer,
      explanation: `Change = (Q${qb} − Q${qa}) ÷ Q${qa} = (${b} − ${a}) ÷ ${a} = ${((b - a) / a * 100).toFixed(1)}%, which rounds to ${correct}%. Use the earlier quarter as the base.`,
      difficulty: clampDiff(3 + (n % 2) - 1),
    },
    stimulus,
    check: (s) => {
      const t = table(s);
      const row = t.rows.find((x) => x[0] === name)!;
      const from = row[qa] as number;
      const to = row[qb] as number;
      return `${Math.round(((to - from) / from) * 100)}%`;
    },
  };
};

/** Convert a foreign-currency invoice using a rates table. */
const currency: Gen = (r, n) => {
  const rates = { Euro: r.pick([1.12, 1.15, 1.18, 1.2]), "US dollar": r.pick([1.25, 1.3, 1.32, 1.4]), "Japanese yen": r.pick([180, 185, 190, 200]) };
  const stimulus: Stimulus = {
    type: "table",
    title: "Exchange rates: units of foreign currency per £1",
    columns: ["Currency", "Rate"],
    rows: Object.entries(rates).map(([k, v]) => [k, v]),
  };
  const cur = r.pick(["Euro", "US dollar"] as const);
  const rate = rates[cur];
  const gbpAmount = r.int(4, 20) * 100;
  const foreign = Math.round(gbpAmount * rate * 100) / 100;
  const correct = Math.round((foreign / rate) * 100) / 100;
  const { options, answer } = mcqOptions(r, gbp(correct), [
    gbp(Math.round(foreign * rate * 100) / 100), // multiplied instead of divided
    gbp(Math.round((foreign - rate) * 100) / 100),
    gbp(Math.round(foreign * 0.8 * 100) / 100),
    gbp(correct + 50),
    gbp(correct - 40),
    gbp(Math.round((foreign / (rate + 0.1)) * 100) / 100),
  ]);
  const sym = cur === "Euro" ? "€" : "$";
  return {
    item: {
      kind: "mcq",
      prompt: `A supplier sends an invoice for ${sym}${foreign.toLocaleString("en-GB", { minimumFractionDigits: 2 })}. Using the table, what is this in pounds?`,
      options,
      answer,
      explanation: `The rate shows how many ${cur === "Euro" ? "euros" : "dollars"} buy £1, so divide: ${foreign} ÷ ${rate} = ${gbp(correct)}. Multiplying would give a number larger than the invoice, which is a quick sanity check.`,
      difficulty: clampDiff(2 + (n % 2)),
    },
    stimulus,
    check: (s) => {
      const t = table(s);
      const rt = t.rows.find((x) => x[0] === cur)![1] as number;
      return gbp(Math.round((foreign / rt) * 100) / 100);
    },
  };
};

/** Total profit on a product from units, price and unit cost. */
const profit: Gen = (r, n) => {
  const names = r.shuffle(PRODUCTS).slice(0, 4);
  const rows = names.map((name) => {
    const cost = r.int(8, 40);
    return [name, r.int(12, 60) * 50, cost + r.int(5, 25), cost];
  });
  const stimulus: Stimulus = { type: "table", title: "Product sales and costs", columns: ["Product", "Units sold", "Price per unit (£)", "Cost per unit (£)"], rows };
  const idx = r.int(0, 3);
  const [name, units, price, cost] = rows[idx] as [string, number, number, number];
  const correct = units * (price - cost);
  const { options, answer } = mcqOptions(r, gbp(correct), [
    gbp(units * price), // revenue
    gbp(units * cost), // total cost
    gbp(price - cost), // per-unit profit
    gbp(correct + units),
    gbp(correct - units * 2),
    gbp(units * (price + cost)),
  ]);
  return {
    item: {
      kind: "mcq",
      prompt: `What was the total profit on ${name}?`,
      options,
      answer,
      explanation: `Profit per unit = ${price} − ${cost} = £${price - cost}. Total profit = ${units} × £${price - cost} = ${gbp(correct)}. Revenue (${gbp(units * price)}) is not profit.`,
      difficulty: clampDiff(2 + (n % 3) - 1),
    },
    stimulus,
    check: (s) => {
      const row = table(s).rows.find((x) => x[0] === name)!;
      return gbp((row[1] as number) * ((row[2] as number) - (row[3] as number)));
    },
  };
};

/** Ratio of two series in a given month, from a bar chart. */
const ratio: Gen = (r, n) => {
  const pairs = [[3, 2], [5, 4], [4, 3], [7, 5], [5, 2], [3, 1]] as const;
  const labels = [...MONTHS].slice(0, 4);
  const a: number[] = [];
  const b: number[] = [];
  const reduced: [number, number][] = [];
  for (let i = 0; i < labels.length; i++) {
    const [p, q] = r.pick(pairs);
    const k = r.int(2, 9) * 10;
    a.push(p * k);
    b.push(q * k);
    reduced.push([p, q]);
  }
  const stimulus: Stimulus = {
    type: "chart",
    kind: "bar",
    title: "Units sold by channel",
    labels,
    series: [
      { name: "Online", values: a },
      { name: "In store", values: b },
    ],
    unit: "units",
  };
  const m = r.int(0, labels.length - 1);
  const [p, q] = reduced[m];
  const fmt = (x: number, y: number) => `${x}:${y}`;
  // Distractors are also in simplest form, so none can be dismissed without doing the working.
  const gcd = (u: number, v: number): number => (v === 0 ? u : gcd(v, u % v));
  const near: [number, number][] = [[q, p], [p + 1, q], [p, q + 1], [p + 2, q + 1], [p + 1, q + 2], [p + 3, q], [p, q + 2], [q + 1, p + 1], [p + 2, q]];
  const { options, answer } = mcqOptions(
    r,
    fmt(p, q),
    near.filter(([x, y]) => gcd(x, y) === 1 && !(x === p && y === q)).map(([x, y]) => fmt(x, y)),
  );
  return {
    item: {
      kind: "mcq",
      prompt: `In ${labels[m]}, what was the ratio of online sales to in-store sales, in its simplest form?`,
      options,
      answer,
      explanation: `${labels[m]}: online ${a[m]}, in store ${b[m]}. Divide both by their highest common factor to get ${fmt(p, q)}. Check the order: online comes first.`,
      difficulty: clampDiff(3 + (n % 2) - 1),
    },
    stimulus,
    check: (s) => {
      const c = chart(s);
      const x = c.series[0].values[m];
      const y = c.series[1].values[m];
      const g = (u: number, v: number): number => (v === 0 ? u : g(v, u % v));
      const d = g(x, y);
      return fmt(x / d, y / d);
    },
  };
};

/** Mean of a line chart's monthly values. */
const mean: Gen = (r, n) => {
  const count = r.pick([4, 5, 6]);
  const labels = [...MONTHS].slice(0, count);
  const avg = r.int(30, 90);
  const offsets = Array.from({ length: count - 1 }, () => r.int(-12, 12));
  offsets.push(-offsets.reduce((s, v) => s + v, 0)); // offsets sum to zero so the mean is a whole number
  const values = offsets.map((o) => avg + o);
  const stimulus: Stimulus = {
    type: "chart",
    kind: "line",
    title: "Customer complaints per month",
    labels,
    series: [{ name: "Complaints", values }],
  };
  const { options, answer } = mcqOptions(r, String(avg), [String(avg + 3), String(avg - 4), String(Math.max(...values)), String(Math.min(...values)), String(avg + 7), String(Math.round(values.reduce((s, v) => s + v, 0)))]);
  return {
    item: {
      kind: "mcq",
      prompt: `What was the mean number of complaints per month over the ${count} months shown?`,
      options,
      answer,
      explanation: `Add the ${count} values (${values.join(" + ")} = ${values.reduce((s, v) => s + v, 0)}) and divide by ${count}: the mean is ${avg}.`,
      difficulty: clampDiff(2 + (n % 2) - 1),
    },
    stimulus,
    check: (s) => {
      const v = chart(s).series[0].values;
      return String(v.reduce((a, b) => a + b, 0) / v.length);
    },
  };
};

/** One department's share of total headcount, to one decimal place. */
const share: Gen = (r, n) => {
  const names = r.shuffle(DEPTS).slice(0, 5);
  const rows = names.map((name) => [name, r.int(8, 60) * 5]);
  const stimulus: Stimulus = { type: "table", title: "Headcount by department", columns: ["Department", "Employees"], rows };
  const idx = r.int(0, 4);
  const total = rows.reduce((s, x) => s + (x[1] as number), 0);
  const value = rows[idx][1] as number;
  const correct = (value / total) * 100;
  const { options, answer } = mcqOptions(r, pct(correct, 1), [
    pct((value / (total - value)) * 100, 1), // share of the others
    pct(correct + 2.5, 1),
    pct(correct - 3.1, 1),
    pct(value / 10, 1),
    pct(correct * 2, 1),
    pct((value / total) * 10, 1),
  ]);
  return {
    item: {
      kind: "mcq",
      prompt: `What percentage of all employees work in ${names[idx]}? Give your answer to one decimal place.`,
      options,
      answer,
      explanation: `Total employees = ${total}. ${names[idx]} = ${value}. Share = ${value} ÷ ${total} × 100 = ${correct.toFixed(1)}%. Divide by the total, not by the rest.`,
      difficulty: clampDiff(3 + (n % 2)),
    },
    stimulus,
    check: (s) => {
      const t = table(s);
      const tot = t.rows.reduce((sum, x) => sum + (x[1] as number), 0);
      return pct(((t.rows.find((x) => x[0] === names[idx])![1] as number) / tot) * 100, 1);
    },
  };
};

const TEMPLATES: [string, Gen][] = [
  ["growth", growth],
  ["currency", currency],
  ["profit", profit],
  ["ratio", ratio],
  ["mean", mean],
  ["share", share],
];

export function buildNumerical(perTemplate = 4): NumericalBank {
  const items: Item[] = [];
  const stimuli: Record<string, Stimulus> = {};
  const checks: NumericalBank["checks"] = {};
  TEMPLATES.forEach(([name, gen], ti) => {
    for (let n = 0; n < perTemplate; n++) {
      const r = rng(1000 + ti * 100 + n);
      const out = gen(r, n);
      const id = `num-${name}-${n + 1}`;
      items.push({ ...out.item, id, stimulus: id } as Item);
      stimuli[id] = out.stimulus;
      checks[id] = out.check;
    }
  });
  return { items, stimuli, checks };
}

export const NUMERICAL = buildNumerical();
