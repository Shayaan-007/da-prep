import { appendFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { rateLimit } from "@/lib/rateLimit";

// Development-only trace of the voice features, written to .diagnostics/voice.log so a failing session can be
// inspected without screenshots. Disabled in production. Holds technical facts only, never audio or answers.
const DIR = path.join(process.cwd(), ".diagnostics");
const FILE = path.join(DIR, "voice.log");
const MAX_FILE = 1_000_000;

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!(await rateLimit(`diag:${ip}`, 300))) return new Response(null, { status: 429 });

  const text = await req.text();
  if (text.length > 4000) return new Response(null, { status: 413 });
  try {
    JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  try {
    await mkdir(DIR, { recursive: true });
    const size = await stat(FILE).then((s) => s.size).catch(() => 0);
    if (size < MAX_FILE) await appendFile(FILE, `${new Date().toISOString()} ${text}\n`);
  } catch {
    /* never fail the request over a log write */
  }
  return new Response(null, { status: 204 });
}
