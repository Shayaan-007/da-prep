// Tiny expression evaluator for the in-app calculator. No eval or Function: the production CSP forbids them.
// Supports + - × ÷ ( ), decimals, unary minus and a postfix % (divide by 100).

type Tok = { t: "num"; v: number } | { t: "op"; v: "+" | "-" | "*" | "/" } | { t: "(" } | { t: ")" } | { t: "%" };

function tokenise(src: string): Tok[] | null {
  const toks: Tok[] = [];
  const s = src.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
  for (let i = 0; i < s.length; ) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i++; // whitespace separates tokens, so "2 3" is two numbers (rejected), not 23
    } else if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const raw = s.slice(i, j);
      if ((raw.match(/\./g) ?? []).length > 1 || raw === ".") return null;
      toks.push({ t: "num", v: Number(raw) });
      i = j;
    } else if ("+-*/".includes(ch)) {
      toks.push({ t: "op", v: ch as "+" | "-" | "*" | "/" });
      i++;
    } else if (ch === "(" || ch === ")" || ch === "%") {
      toks.push({ t: ch });
      i++;
    } else return null;
  }
  return toks;
}

/** Returns the result, or null when the expression is incomplete, malformed or divides by zero. */
export function evaluate(src: string): number | null {
  const toks = tokenise(src);
  if (!toks || !toks.length) return null;
  let pos = 0;
  let bad = false;

  const primary = (): number => {
    const tk = toks[pos];
    if (!tk) return (bad = true), 0;
    if (tk.t === "op" && (tk.v === "-" || tk.v === "+")) {
      pos++;
      const v = primary();
      return tk.v === "-" ? -v : v;
    }
    let v = 0;
    if (tk.t === "num") {
      pos++;
      v = tk.v;
    } else if (tk.t === "(") {
      pos++;
      v = expr();
      if (toks[pos]?.t !== ")") return (bad = true), 0;
      pos++;
    } else return (bad = true), 0;
    while (toks[pos]?.t === "%") {
      pos++;
      v /= 100;
    }
    return v;
  };
  const term = (): number => {
    let v = primary();
    for (;;) {
      const tk = toks[pos];
      if (tk?.t === "op" && (tk.v === "*" || tk.v === "/")) {
        pos++;
        const r = primary();
        if (tk.v === "/" && r === 0) bad = true;
        v = tk.v === "*" ? v * r : v / r;
      } else return v;
    }
  };
  const expr = (): number => {
    let v = term();
    for (;;) {
      const tk = toks[pos];
      if (tk?.t === "op" && (tk.v === "+" || tk.v === "-")) {
        pos++;
        const r = term();
        v = tk.v === "+" ? v + r : v - r;
      } else return v;
    }
  };

  const out = expr();
  if (bad || pos !== toks.length || !Number.isFinite(out)) return null;
  return out;
}

/** Display form: trims floating-point noise (0.1 + 0.2 shows as 0.3). */
export const formatResult = (n: number) => String(Number(n.toPrecision(12)));
