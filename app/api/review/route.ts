import { askJson } from "@/lib/ai";
import { mockReview } from "@/lib/mocks";
import { reviewInput, reviewOutput, reviewSystem, reviewUser } from "@/lib/writing";
import { guardAi } from "@/lib/server/guard";
import { screenText } from "@/lib/server/safety";

export const maxDuration = 120;

export async function POST(req: Request) {
  const gate = await guardAi(req, "review", 6);
  if (!gate.ok) return gate.response;
  const parsed = reviewInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
  const { kind, text, jobAd } = parsed.data;
  const blocked = await screenText(text, jobAd);
  if (blocked) return blocked;
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
