import { rateLimit } from "@/lib/rateLimit";
import { admin, userFromRequest } from "@/lib/server/auth";

/** Hard ceiling on AI calls per signed-in user per day, Pro included. Bounds spend if a client misbehaves. */
export const DAILY_AI_CALLS = 150;

/** Best-effort client IP. Vercel sets x-real-ip / overwrites x-forwarded-for; take the first hop only. */
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

type Guard = { ok: true } | { ok: false; response: Response };

const deny = (error: string, status: number): Guard => ({ ok: false, response: Response.json({ error }, { status }) });

/**
 * Front door for every route that spends OpenAI money.
 * With ENFORCE_LIMITS=true the caller must be signed in and is held to a daily budget; the per-minute
 * rate limit is keyed on the user id when known, otherwise on the client IP.
 */
export async function guardAi(req: Request, name: string, perMinute = 20): Promise<Guard> {
  const enforce = process.env.ENFORCE_LIMITS === "true";
  let who = clientIp(req);
  if (enforce) {
    const a = admin();
    if (!a) return deny("Usage limits are enabled but Supabase is not configured.", 500);
    const user = await userFromRequest(req);
    if (!user) return deny("Sign in to use this feature.", 401);
    who = user.id;
    const { data, error } = await a.rpc("consume_ai_call", {
      p_uid: user.id,
      p_day: new Date().toISOString().slice(0, 10),
      p_limit: DAILY_AI_CALLS,
    });
    if (error) {
      console.error(error);
      return deny("Could not check your allowance.", 500);
    }
    if (!data) return deny("You've reached today's practice limit. Try again tomorrow.", 429);
  }
  if (!(await rateLimit(`${name}:${who}`, perMinute))) return deny("Too many requests, slow down.", 429);
  return { ok: true };
}
