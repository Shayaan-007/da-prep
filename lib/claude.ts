import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

export const MODEL = "claude-sonnet-5-5";

let client: Anthropic | null = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return (client ??= new Anthropic());
}

/** Ask Claude for JSON and validate it against a zod schema. */
export async function askJson<T extends z.ZodTypeAny>(
  system: string,
  user: string,
  schema: T,
  maxTokens = 1200,
): Promise<z.infer<T>> {
  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: `${system}\n\nRespond with a single JSON object only. No prose, no code fences.`,
    messages: [{ role: "user", content: user }],
  });
  const text = res.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Model returned no JSON");
  return schema.parse(JSON.parse(text.slice(start, end + 1)));
}
