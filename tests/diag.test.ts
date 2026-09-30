import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatDiag } from "@/lib/diag";

let dir = "";
beforeEach(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), "da-diag-"));
  vi.spyOn(process, "cwd").mockReturnValue(dir);
  vi.resetModules();
});
afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  await rm(dir, { recursive: true, force: true });
});

const post = (route: { POST: (r: Request) => Promise<Response> }, body: string, ip: string) =>
  route.POST(new Request("http://localhost/api/diag", { method: "POST", body, headers: { "x-forwarded-for": ip } }));

describe("/api/diag (development-only voice trace)", () => {
  it("appends technical events to .diagnostics/voice.log", async () => {
    const route = await import("@/app/api/diag/route");
    const res = await post(route, JSON.stringify({ sid: "abc", event: "mic-open", data: { label: "USB Headset" } }), "1.1.1.1");
    expect(res.status).toBe(204);
    const written = await readFile(path.join(dir, ".diagnostics", "voice.log"), "utf8");
    expect(written).toContain('"event":"mic-open"');
    expect(written).toContain("USB Headset");
  });

  it("is disabled in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const route = await import("@/app/api/diag/route");
    expect((await post(route, JSON.stringify({ event: "x" }), "1.1.1.2")).status).toBe(404);
  });

  it("rejects malformed and oversized payloads", async () => {
    const route = await import("@/app/api/diag/route");
    expect((await post(route, "not json", "1.1.1.3")).status).toBe(400);
    expect((await post(route, JSON.stringify({ event: "x".repeat(5000) }), "1.1.1.4")).status).toBe(413);
  });
});

describe("diagnostics formatting", () => {
  it("renders one readable line per event", () => {
    const text = formatDiag([
      { t: "10:00:00.000", event: "mic-start" },
      { t: "10:00:01.500", event: "mic-open", data: { label: "Mic", muted: false } },
    ]);
    expect(text.split("\n")).toEqual(['10:00:00.000 mic-start', '10:00:01.500 mic-open {"label":"Mic","muted":false}']);
  });
});
