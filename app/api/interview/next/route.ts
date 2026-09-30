import { askJson } from "@/lib/ai";
import {
  nextInput,
  nextOutput,
  nextQuestionSystem,
  nextQuestionUser,
} from "@/lib/interview";
import { mockQuestion } from "@/lib/mocks";
import { rateLimit } from "@/lib/rateLimit";
import { consumeInterview } from "@/lib/server/usage";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`next:${ip}`)) {
    return Response.json({ error: "Too many requests, slow down." }, { status: 429 });
  }
  const parsed = nextInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  const { jobAd, cv, stage, sector, history } = parsed.data;
  // The first question of an interview counts against the free allowance.
  if (history.length === 0) {
    const usage = await consumeInterview(req);
    if (!usage.ok) return Response.json({ error: usage.error }, { status: usage.status });
  }
  try {
    const out = await askJson({
      system: nextQuestionSystem(stage, sector),
      user: nextQuestionUser(jobAd, cv, history),
      schema: nextOutput,
      tier: "fast",
      maxTokens: 2000,
      mock: () => mockQuestion(history),
    });
    return Response.json(out);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not generate a question." }, { status: 500 });
  }
}
