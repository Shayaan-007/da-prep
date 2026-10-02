import { askJson } from "@/lib/ai";
import { mockReview } from "@/lib/mocks";
import { reviewInput, reviewOutput, reviewSystem, reviewUser } from "@/lib/writing";
import { guardAi } from "@/lib/server/guard";
import { screenText } from "@/lib/server/safety";
import { consumeReview } from "@/lib/server/usage";

export const maxDuration = 120;

export async function POST(req: Request) {
  const gate = await guardAi(req, "review", 6);
  if (!gate.ok) return gate.response;
  const parsed = reviewInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
  const { kind, text, jobAd } = parsed.data;
  const blocked = await screenText(text, jobAd);
  if (blocked) return blocked;
  // Free accounts get a couple of reviews a week; Pro is unlimited. Counted after the safety check so blocked text is free.
  const usage = await consumeReview(req);
  if (!usage.ok) return Response.json({ error: usage.error }, { status: usage.status });
  try {
    const out = await askJson({
      system: reviewSystem(kind),
      user: reviewUser(text, jobAd),
      schema: reviewOutput,
      tier: "smart",
      maxTokens: 6000,
      mock: mockReview,
    });
    return Response.json(out);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not review your text." }, { status: 500 });
  }
}
