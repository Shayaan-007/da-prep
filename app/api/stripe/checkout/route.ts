import Stripe from "stripe";
import { SITE_URL } from "@/lib/site";
import { admin, userFromRequest } from "@/lib/server/auth";

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;
  if (!key || !price) {
    return Response.json({ error: "Payments are not configured." }, { status: 503 });
  }
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });

  // Don't sell a second subscription, and reuse the Stripe customer so billing history stays in one place.
  const { data: profile } = (await admin()?.from("profiles").select("plan, stripe_customer_id").eq("id", user.id).maybeSingle()) ?? {};
  if (profile?.plan === "pro") {
    return Response.json({ error: "You're already on Pro." }, { status: 409 });
  }

  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    client_reference_id: user.id,
    ...(profile?.stripe_customer_id
      ? { customer: profile.stripe_customer_id }
      : { customer_email: user.email ?? undefined }),
    subscription_data: { metadata: { user_id: user.id } },
    success_url: `${SITE_URL}/pricing?success=1`,
    cancel_url: `${SITE_URL}/pricing`,
  });
  return Response.json({ url: session.url });
}
