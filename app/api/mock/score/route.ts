import { askJson } from "@/lib/ai";
import { mockMockScore, mockScoreInput, mockScoreOutput, mockScoreSystem, mockScoreUser } from "@/lib/mockprocess/score";
import { guardAi } from "@/lib/server/guard";
import { screenText } from "@/lib/server/safety";
import { consumeInterview } from "@/lib/server/usage";

export const maxDuration = 120;

export async function POST(req: Request) {
  const gate = await guardAi(req, "mockscore", 8);
  if (!gate.ok) return gate.response;
  const parsed = mockScoreInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
  const input = parsed.data;
  const blocked = await screenText(...input.turns.map((t) => t.answer));
  if (blocked) return blocked;
  // A whole mock process counts as one interview against the free allowance, charged on its first scored stage.
  if (input.first) {
    const usage = await consumeInterview(req);
    if (!usage.ok) return Response.json({ error: usage.error }, { status: usage.status });
  }
  try {
    const out = await askJson({
      system: mockScoreSystem(input),
      user: mockScoreUser(input),
      schema: mockScoreOutput,
      tier: "smart",
      maxTokens: 9000,
      mock: () => mockMockScore(input),
    });
    if (out.turns.length !== input.turns.length) throw new Error("Turn count mismatch");
    return Response.json(out);
  } catch (e) {
    console.error(e, input.stageName);
    return Response.json({ error: "Could not score this stage." }, { status: 500 });
  }
}
