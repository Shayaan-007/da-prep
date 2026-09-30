import { admin, userFromRequest } from "@/lib/server/auth";

/** Permanently delete the signed-in user's cloud data and account. */
export async function DELETE(req: Request) {
  const db = admin();
  const user = await userFromRequest(req);
  if (!db || !user) return Response.json({ error: "Not signed in." }, { status: 401 });

  // user_data, usage and profiles also cascade from auth.users; deleting explicitly keeps this obvious.
  await db.from("user_data").delete().eq("user_id", user.id);
  await db.from("usage").delete().eq("user_id", user.id);
  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) return Response.json({ error: "Could not delete the account." }, { status: 500 });
  return Response.json({ ok: true });
}
