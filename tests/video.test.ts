import { beforeEach, describe, expect, it, vi } from "vitest";

const askJson = vi.fn();
const transcribeAudio = vi.fn();

vi.mock("@/lib/ai", () => ({
  askJson: (...a: unknown[]) => askJson(...a),
  transcribeAudio: (...a: unknown[]) => transcribeAudio(...a),
  transcribeModel: () => "gpt-transcribe",
  mockEnabled: () => false,
}));
vi.mock("@/lib/server/usage", () => ({ consumeInterview: async () => ({ ok: true }) }));

import { POST as next } from "@/app/api/interview/next/route";
import { GET as transcribeReady, POST as transcribe } from "@/app/api/transcribe/route";
import { THEMES } from "@/lib/interview";

let n = 100;
const ip = () => `10.1.0.${++n}`;
const ad = "Degree apprenticeship in software engineering at Example Ltd, working with the platform team.";

function nextReq(history: { question: string; answer: string }[], stage = "motivation") {
  return new Request("http://localhost/api/interview/next", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip() },
    body: JSON.stringify({ jobAd: ad, stage, sector: "digital", history }),
  });
}

function audioReq(file?: File | string, address = ip()) {
  const form = new FormData();
  if (file !== undefined) form.append("audio", file);
  return new Request("http://localhost/api/transcribe", {
    method: "POST",
    headers: { "x-forwarded-for": address },
    body: form,
  });
}
const clip = (bytes = 2000, type = "audio/webm") => new File([new Uint8Array(bytes)], "answer.webm", { type });

beforeEach(() => {
  askJson.mockReset();
  transcribeAudio.mockReset();
});

describe("question planning", () => {
  it("gives each question its own theme and lists what was already asked", async () => {
    askJson.mockResolvedValue({ question: "How will you balance work and study at the same time?" });
    const history = [
      { question: "What draws you to a degree apprenticeship instead of university?", answer: "(no answer given)" },
      { question: "Why this employer and this software engineering role specifically?", answer: "(no answer given)" },
      { question: "What have you done so far that shows your interest in technology?", answer: "(no answer given)" },
    ];
    await next(nextReq(history));
    const call = askJson.mock.calls[0][0] as { system: string; user: string };
    expect(call.system).toContain("question 4 of 5");
    expect(call.system).toContain(THEMES.motivation[3]);
    expect(call.system).toMatch(/Never repeat, rephrase or re-ask/);
    expect(call.user).toContain("<questions_already_asked>");
    for (const h of history) expect(call.user).toContain(h.question);
  });

  it("retries once, with a nudge, if the model repeats an earlier question", async () => {
    const prior = "What draws you to a degree apprenticeship rather than university?";
    askJson
      .mockResolvedValueOnce({ question: "Why are you drawn to a degree apprenticeship instead of university?" })
      .mockResolvedValueOnce({ question: "How have you explored software engineering outside lessons?" });
    const res = await next(nextReq([{ question: prior, answer: "(no answer given)" }]));
    expect((await res.json()).question).toBe("How have you explored software engineering outside lessons?");
    expect(askJson).toHaveBeenCalledTimes(2);
    expect((askJson.mock.calls[0][0] as { system: string }).system).not.toMatch(/repeated or rephrased/);
    expect((askJson.mock.calls[1][0] as { system: string }).system).toMatch(/repeated or rephrased/);
  });

  it("falls back to a built-in question if the model keeps repeating itself", async () => {
    const prior = "What draws you to a degree apprenticeship rather than university?";
    askJson.mockResolvedValue({ question: "Why are you drawn to a degree apprenticeship instead of university?" });
    const res = await next(nextReq([{ question: prior, answer: "(no answer given)" }]));
    const { question } = await res.json();
    expect(askJson).toHaveBeenCalledTimes(2);
    expect(question).not.toBe("");
    expect(question).not.toMatch(/degree apprenticeship rather than/i);
  });

  it("never repeats a question across a whole five-question interview, even with a stubborn model", async () => {
    askJson.mockResolvedValue({ question: "Why do you want this degree apprenticeship?" });
    const asked: { question: string; answer: string }[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await next(nextReq(asked, i % 2 ? "competency" : "competency"));
      const { question } = await res.json();
      asked.push({ question, answer: "(no answer given)" });
    }
    expect(new Set(asked.map((a) => a.question)).size).toBe(5);
  });
});

describe("GET /api/transcribe (readiness check)", () => {
  it("reports whether voice transcription is configured on this server", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    expect(await transcribeReady().json()).toEqual({ configured: true, model: "gpt-transcribe" });
    vi.stubEnv("OPENAI_API_KEY", "");
    expect(await transcribeReady().json()).toEqual({ configured: false, model: "gpt-transcribe" });
    vi.unstubAllEnvs();
  });
});

describe("POST /api/transcribe", () => {
  it("returns the transcript", async () => {
    transcribeAudio.mockResolvedValue("I led a robotics team.");
    const res = await transcribe(audioReq(clip()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ text: "I led a robotics team." });
    expect(transcribeAudio).toHaveBeenCalledTimes(1);
  });

  it("rejects a missing file, an empty file, a non-audio file and an oversized one before calling the AI", async () => {
    expect((await transcribe(audioReq())).status).toBe(400);
    expect((await transcribe(audioReq("just text"))).status).toBe(400);
    expect((await transcribe(audioReq(clip(0)))).status).toBe(400);
    expect((await transcribe(audioReq(clip(100, "text/plain")))).status).toBe(415);
    expect((await transcribe(audioReq(clip(9 * 1024 * 1024)))).status).toBe(413);
    expect(transcribeAudio).not.toHaveBeenCalled();
  });

  it("accepts browsers that label audio recordings as video/webm or audio/mp4", async () => {
    transcribeAudio.mockResolvedValue("ok");
    expect((await transcribe(audioReq(clip(500, "video/webm")))).status).toBe(200);
    expect((await transcribe(audioReq(clip(500, "audio/mp4")))).status).toBe(200);
  });

  it("returns an empty transcript when nothing was said", async () => {
    transcribeAudio.mockResolvedValue("");
    const res = await transcribe(audioReq(clip()));
    expect(res.status).toBe(200);
    expect((await res.json()).text).toBe("");
  });

  it("reports a friendly error if transcription fails", async () => {
    transcribeAudio.mockRejectedValue(new Error("upstream"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await transcribe(audioReq(clip()));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/Could not transcribe/);
  });

  it("rate limits repeated uploads from one IP", async () => {
    transcribeAudio.mockResolvedValue("hi");
    const same = "7.7.7.7";
    const statuses: number[] = [];
    for (let i = 0; i < 17; i++) statuses.push((await transcribe(audioReq(clip(), same))).status);
    expect(statuses.slice(0, 15).every((s) => s === 200)).toBe(true);
    expect(statuses.slice(15)).toEqual([429, 429]);
  });
});
