import { admin, userFromRequest } from "@/lib/server/auth";

export const FREE_INTERVIEWS = 2;

type Result = { ok: true } | { ok: false; status: number; error: string };

/**
 * Count one interview against the caller's monthly free allowance.
 * Only enforced when ENFORCE_LIMITS=true (needs Supabase + service role key); otherwise always allowed.
 */
export async function consumeInterview(req: Request): Promise<Result> {
  if (process.env.ENFORCE_LIMITS !== "true") return { ok: true };
  const a = admin();
  if (!a) return { ok: false, status: 500, error: "Usage limits are enabled but Supabase is not configured." };
  const user = await userFromRequest(req);
  if (!user) return { ok: false, status: 401, error: "Sign in to start an interview." };
  const { data, error } = await a.rpc("consume_interview", {
    p_uid: user.id,
    p_period: new Date().toISOString().slice(0, 7),
    p_limit: FREE_INTERVIEWS,
  });
  if (error) {
    console.error(error);
    return { ok: false, status: 500, error: "Could not check your allowance." };
  }
  if (!data) {
    return {
      ok: false,
      status: 402,
      error: `You've used your ${FREE_INTERVIEWS} free interviews this month. Upgrade to Pro for unlimited practice.`,
    };
  }
  return { ok: true };
}
