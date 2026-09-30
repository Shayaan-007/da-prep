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

const extensionFor = (mime: string) =>
  mime.includes("mp4") ? "mp4" : mime.includes("ogg") ? "ogg" : mime.includes("wav") ? "wav" : "webm";

/** Upload a recorded answer and get the transcript back. */
export async function transcribeBlob(blob: Blob): Promise<string> {
  const body = new FormData();
  body.append("audio", blob, `answer.${extensionFor(blob.type)}`);
  const res = await fetch("/api/transcribe", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Could not transcribe your answer.");
  return (data.text as string) ?? "";
}
