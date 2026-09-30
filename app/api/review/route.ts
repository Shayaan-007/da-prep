import { askJson } from "@/lib/ai";
import { mockReview } from "@/lib/mocks";
import { rateLimit } from "@/lib/rateLimit";
import { reviewInput, reviewOutput, reviewSystem, reviewUser } from "@/lib/writing";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`review:${ip}`, 6)) {
    return Response.json({ error: "Too many requests, slow down." }, { status: 429 });
  }
  const parsed = reviewInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
  const { kind, text, jobAd } = parsed.data;
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
