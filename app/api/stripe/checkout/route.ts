import Stripe from "stripe";
import { userFromRequest } from "@/lib/server/auth";

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;
  if (!key || !price) {
    return Response.json({ error: "Payments are not configured." }, { status: 503 });
  }
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });

  const origin = new URL(req.url).origin;
  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,
    success_url: `${origin}/pricing?success=1`,
    cancel_url: `${origin}/pricing`,
  });
  return Response.json({ url: session.url });
}
