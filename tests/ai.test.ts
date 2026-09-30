import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const create = vi.fn();
vi.mock("openai", () => ({
  default: class {
    responses = { create: (...a: unknown[]) => create(...a) };
  },
}));

import { askJson, modelFor } from "@/lib/ai";

const schema = z.object({ question: z.string() });
const ok = (text: string) => ({ status: "completed", output_text: text });
const base = { system: "You are an interviewer.", user: "Advert goes here.", schema };

beforeEach(() => {
  create.mockReset();
  vi.stubEnv("OPENAI_API_KEY", "sk-test");
  vi.stubEnv("OPENAI_MODEL", "");
  vi.stubEnv("OPENAI_MODEL_FAST", "");
  vi.stubEnv("MOCK_AI", "");
});
afterEach(() => vi.unstubAllEnvs());

describe("configuration", () => {
  it("fails clearly when no API key is configured", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    await expect(askJson(base)).rejects.toThrow(/OPENAI_API_KEY/);
    expect(create).not.toHaveBeenCalled();
  });

  it("picks models by tier with env overrides", () => {
    expect(modelFor("smart")).toBe("gpt-6.1-sol");
    expect(modelFor("fast")).toBe("gpt-6-luna");
    vi.stubEnv("OPENAI_MODEL", "custom-smart");
    vi.stubEnv("OPENAI_MODEL_FAST", "custom-fast");
    expect(modelFor("smart")).toBe("custom-smart");
    expect(modelFor("fast")).toBe("custom-fast");
  });
});

describe("request shape", () => {
  it("sends a JSON-mode Responses API request that doesn't retain data", async () => {
    create.mockResolvedValue(ok('{"question":"Why us?"}'));
    await askJson({ ...base, tier: "fast", maxTokens: 1234 });

    const req = create.mock.calls[0][0];
    expect(req.model).toBe("gpt-6-luna");
    expect(req.input).toBe("Advert goes here.");
    expect(req.instructions).toContain("You are an interviewer.");
    expect(req.instructions).toMatch(/single JSON object/);
    expect(req.text).toEqual({ format: { type: "json_object" } });
    expect(req.max_output_tokens).toBe(1234);
    expect(req.store).toBe(false);
    expect(req).not.toHaveProperty("temperature");
  });

  it("defaults to the smart tier", async () => {
    create.mockResolvedValue(ok('{"question":"q"}'));
    await askJson(base);
    expect(create.mock.calls[0][0].model).toBe("gpt-6.1-sol");
  });
});

describe("parsing and retries", () => {
  it("returns validated output and tolerates stray text around the JSON", async () => {
    create.mockResolvedValue(ok('Here you go: {"question":"Tell me about a project."} Thanks!'));
    await expect(askJson(base)).resolves.toEqual({ question: "Tell me about a project." });
  });

  it("retries once when the reply isn't valid JSON", async () => {
    create.mockResolvedValueOnce(ok("sorry, no json")).mockResolvedValueOnce(ok('{"question":"ok"}'));
    await expect(askJson(base)).resolves.toEqual({ question: "ok" });
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("retries once when the JSON doesn't match the schema, then gives up", async () => {
    create.mockResolvedValue(ok('{"wrong":1}'));
    await expect(askJson(base)).rejects.toThrow();
    expect(create).toHaveBeenCalledTimes(2);
  });

  it("does not retry when the output was cut off, and says why", async () => {
    create.mockResolvedValue({ status: "incomplete", incomplete_details: { reason: "max_output_tokens" }, output_text: "" });
    await expect(askJson(base)).rejects.toThrow(/cut off.*max_output_tokens/);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("does not retry API errors such as rate limits or bad keys", async () => {
    create.mockRejectedValue(new Error("401 invalid api key"));
    await expect(askJson(base)).rejects.toThrow(/401/);
    expect(create).toHaveBeenCalledTimes(1);
  });
});

describe("mock mode", () => {
  it("serves the canned response without calling the API", async () => {
    vi.stubEnv("MOCK_AI", "1");
    vi.stubEnv("OPENAI_API_KEY", "");
    const out = await askJson({ ...base, mock: () => ({ question: "canned" }) });
    expect(out).toEqual({ question: "canned" });
    expect(create).not.toHaveBeenCalled();
  });

  it("is ignored in production", async () => {
    vi.stubEnv("MOCK_AI", "1");
    vi.stubEnv("NODE_ENV", "production");
    create.mockResolvedValue(ok('{"question":"real"}'));
    const out = await askJson({ ...base, mock: () => ({ question: "canned" }) });
    expect(out).toEqual({ question: "real" });
    expect(create).toHaveBeenCalledTimes(1);
  });
});
