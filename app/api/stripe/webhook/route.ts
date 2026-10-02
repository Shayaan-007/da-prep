import Stripe from "stripe";
import { admin } from "@/lib/server/auth";

// Subscription states that should keep Pro access. past_due keeps it while Stripe retries the card.
const ACTIVE = new Set<Stripe.Subscription.Status>(["active", "trialing", "past_due"]);

const idOf = (c: string | { id: string } | null) => (typeof c === "string" ? c : (c?.id ?? null));

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

  let error: unknown = null;
  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.client_reference_id) {
      ({ error } = await db.from("profiles").upsert({
        id: s.client_reference_id,
        plan: "pro",
        stripe_customer_id: idOf(s.customer),
      }));
    }
  } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customer = idOf(sub.customer);
    const plan = event.type === "customer.subscription.updated" && ACTIVE.has(sub.status) ? "pro" : "free";
    if (customer) ({ error } = await db.from("profiles").update({ plan }).eq("stripe_customer_id", customer));
  }
  if (error) {
    // A non-2xx makes Stripe retry, so a transient database failure doesn't leave someone paid but on Free.
    console.error(error);
    return Response.json({ error: "Could not update the plan." }, { status: 500 });
  }
  return Response.json({ received: true });
}
