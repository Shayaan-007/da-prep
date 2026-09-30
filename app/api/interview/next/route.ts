import { askJson } from "@/lib/ai";
import {
  fallbackQuestion,
  isDuplicateQuestion,
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
    const index = history.length;
    const asked = history.map((t) => t.question);
    const user = nextQuestionUser(jobAd, cv, history);

    // Each question has its own theme. If the model still repeats an earlier question, retry once with a nudge,
    // then fall back to a built-in question so the candidate never sees the same question twice.
    let question = "";
    for (let attempt = 0; attempt < 2; attempt++) {
      const out = await askJson({
        system: nextQuestionSystem(stage, sector, index, attempt > 0),
        user,
        schema: nextOutput,
        tier: "fast",
        maxTokens: 2000,
        mock: () => mockQuestion(history),
      });
      if (!isDuplicateQuestion(out.question, asked)) {
        question = out.question;
        break;
      }
    }
    if (!question) question = fallbackQuestion(stage, index, asked);
    return Response.json({ question });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not generate a question." }, { status: 500 });
  }
}
