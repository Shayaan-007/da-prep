import { askJson } from "@/lib/claude";
import { mockStar } from "@/lib/mocks";
import { rateLimit } from "@/lib/rateLimit";
import { starInput, starOutput, starSystem, starUser } from "@/lib/writing";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`star:${ip}`, 10)) {
    return Response.json({ error: "Too many requests, slow down." }, { status: 429 });
  }
  const parsed = starInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
  try {
    const out = await askJson(
      starSystem(),
      starUser(parsed.data.notes, parsed.data.competency),
      starOutput,
      800,
      mockStar,
    );
    return Response.json(out);
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not build your STAR answer." }, { status: 500 });
  }
}
