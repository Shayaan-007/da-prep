import { askJson } from "@/lib/claude";
import { scoreInput, scoreOutput, scoreSystem, scoreUser } from "@/lib/interview";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`score:${ip}`, 6)) {
    return Response.json({ error: "Too many requests, slow down." }, { status: 429 });
  }
  const parsed = scoreInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  const { jobAd, stage, turns } = parsed.data;
  try {
    const out = await askJson(scoreSystem(), scoreUser(jobAd, turns), scoreOutput, 3500);
    if (out.turns.length !== turns.length) throw new Error("Turn count mismatch");
    return Response.json(out);
  } catch (e) {
    console.error(e, stage);
    return Response.json({ error: "Could not score the interview." }, { status: 500 });
  }
}
