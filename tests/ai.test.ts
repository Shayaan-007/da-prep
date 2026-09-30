import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const create = vi.fn();
const transcribe = vi.fn();
vi.mock("openai", () => ({
  default: class {
    responses = { create: (...a: unknown[]) => create(...a) };
    audio = { transcriptions: { create: (...a: unknown[]) => transcribe(...a) } };
  },
}));

import { askJson, modelFor, transcribeAudio, transcribeModel } from "@/lib/ai";

const schema = z.object({ question: z.string() });
const ok = (text: string) => ({ status: "completed", output_text: text });
const base = { system: "You are an interviewer.", user: "Advert goes here.", schema };

beforeEach(() => {
  create.mockReset();
  transcribe.mockReset();
  vi.stubEnv("OPENAI_TRANSCRIBE_MODEL", "");
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
    // JSON mode needs the word "JSON" in the input messages, so the prompt goes in a system message.
    expect(req.input).toHaveLength(2);
    expect(req.input[0].role).toBe("system");
    expect(req.input[0].content).toContain("You are an interviewer.");
    expect(req.input[0].content).toMatch(/JSON/);
    expect(req.input[1]).toEqual({ role: "user", content: "Advert goes here." });
    expect(req).not.toHaveProperty("instructions");
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

describe("transcription", () => {
  const file = new File([new Uint8Array(100)], "answer.webm", { type: "audio/webm" });

  it("sends the recording to the transcription model and returns trimmed text", async () => {
    transcribe.mockResolvedValue({ text: "  I led a robotics team.  " });
    await expect(transcribeAudio(file)).resolves.toBe("I led a robotics team.");
    const req = transcribe.mock.calls[0][0];
    expect(req.file).toBe(file);
    expect(req.model).toBe("gpt-transcribe");
    expect(req.languages).toEqual(["en"]);
  });

  it("uses the model override from the environment", async () => {
    vi.stubEnv("OPENAI_TRANSCRIBE_MODEL", "my-transcriber");
    expect(transcribeModel()).toBe("my-transcriber");
    transcribe.mockResolvedValue({ text: "hi" });
    await transcribeAudio(file);
    expect(transcribe.mock.calls[0][0].model).toBe("my-transcriber");
  });

  it("returns an empty string when no speech was detected", async () => {
    transcribe.mockResolvedValue({ text: "" });
    await expect(transcribeAudio(file)).resolves.toBe("");
  });

  it("fails clearly without an API key and passes API errors through", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    await expect(transcribeAudio(file)).rejects.toThrow(/OPENAI_API_KEY/);
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    transcribe.mockRejectedValue(new Error("413 too large"));
    await expect(transcribeAudio(file)).rejects.toThrow(/413/);
  });

  it("serves a canned transcript in mock mode without calling the API", async () => {
    vi.stubEnv("MOCK_AI", "1");
    vi.stubEnv("OPENAI_API_KEY", "");
    await expect(transcribeAudio(file)).resolves.toMatch(/robotics/);
    expect(transcribe).not.toHaveBeenCalled();
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
