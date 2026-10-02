export const dynamic = "force-dynamic";

/** Liveness probe for uptime monitors. Reports which integrations are configured, never their values. */
export function GET() {
  return Response.json({
    ok: true,
    ai: Boolean(process.env.OPENAI_API_KEY),
    accounts: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    payments: Boolean(process.env.STRIPE_SECRET_KEY),
    limits: process.env.ENFORCE_LIMITS === "true",
    sharedRateLimit: Boolean(process.env.UPSTASH_REDIS_REST_URL),
  });
}
