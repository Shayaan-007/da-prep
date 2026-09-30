import Stripe from "stripe";
import { admin } from "@/lib/server/auth";

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const db = admin();
  const sig = req.headers.get("stripe-signature");
  if (!key || !secret || !db || !sig) {
    return Response.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const stripe = new Stripe(key);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return Response.json({ error: "Bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.client_reference_id) {
      await db.from("profiles").upsert({
        id: s.client_reference_id,
        plan: "pro",
        stripe_customer_id: typeof s.customer === "string" ? s.customer : s.customer?.id,
      });
    }
  } else if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    await db.from("profiles").update({ plan: "free" }).eq("stripe_customer_id", customer);
  }
  return Response.json({ received: true });
}
