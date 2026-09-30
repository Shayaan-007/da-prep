// Simple in-memory limiter. Fine for one server instance; swap for Redis/Upstash when deployed to Vercel at scale.
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max = 20, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
