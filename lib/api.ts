import { supabase } from "@/lib/supabase";

/** POST JSON to our API, attaching the Supabase access token when signed in. */
export async function postJson<T>(url: string, body?: unknown, method = "POST"): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = (await supabase()?.auth.getSession())?.data.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data as T;
}
