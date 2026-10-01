import Stripe from "stripe";
import { admin, userFromRequest } from "@/lib/server/auth";

/** Permanently delete the signed-in user's cloud data and account, and cancel any subscription first. */
export async function DELETE(req: Request) {
  const db = admin();
  const user = await userFromRequest(req);
  if (!db || !user) return Response.json({ error: "Not signed in." }, { status: 401 });

  // Cancel billing before deleting anything, so a failure here never leaves someone charged for a deleted account.
  const { data: profile } = await db.from("profiles").select("stripe_customer_id").eq("id", user.id).maybeSingle();
  const key = process.env.STRIPE_SECRET_KEY;
  if (profile?.stripe_customer_id && key) {
    try {
      const stripe = new Stripe(key);
      const subs = await stripe.subscriptions.list({ customer: profile.stripe_customer_id, status: "all", limit: 20 });
      for (const sub of subs.data) {
        if (sub.status !== "canceled" && sub.status !== "incomplete_expired") await stripe.subscriptions.cancel(sub.id);
      }
    } catch (e) {
      console.error(e);
      return Response.json({ error: "Could not cancel your subscription, so your account was not deleted." }, { status: 502 });
    }
  }

  // These also cascade from auth.users; deleting explicitly keeps this obvious.
  for (const table of ["user_data", "usage", "ai_usage"]) {
    const { error } = await db.from(table).delete().eq("user_id", user.id);
    if (error) {
      console.error(error);
      return Response.json({ error: "Could not delete your data." }, { status: 500 });
    }
  }
  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) return Response.json({ error: "Could not delete the account." }, { status: 500 });
  return Response.json({ ok: true });
}
