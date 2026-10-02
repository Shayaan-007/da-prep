// Fixed-window rate limiter. Uses Upstash Redis (REST) when UPSTASH_REDIS_REST_URL / _TOKEN are set, so limits hold
// across serverless instances. Otherwise (local dev, or if Upstash is unreachable) it falls back to per-instance memory.
const hits = new Map<string, number[]>();
let lastSweep = 0;

function memoryLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  if (now - lastSweep > 60_000) {
    // Drop idle keys so the map can't grow without bound.
    lastSweep = now;
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

async function redisLimit(url: string, token: string, key: string, max: number, windowMs: number): Promise<boolean | null> {
  const ttl = Math.ceil(windowMs / 1000);
  const bucket = `rl:${key}:${Math.floor(Date.now() / windowMs)}`;
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([
        ["INCR", bucket],
        ["EXPIRE", bucket, ttl, "NX"],
      ]),
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    const out = (await res.json()) as { result?: number }[];
    const count = out[0]?.result;
    return typeof count === "number" ? count <= max : null;
  } catch {
    return null;
  }
}

export async function rateLimit(key: string, max = 20, windowMs = 60_000): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    const ok = await redisLimit(url, token, key, max, windowMs);
    if (ok !== null) return ok;
  }
  return memoryLimit(key, max, windowMs);
}
