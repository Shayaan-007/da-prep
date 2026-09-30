import { describe, expect, it } from "vitest";
import { describeMicError, micSupportProblem, mutedAdvice, pickMimeType, SILENCE_PEAK } from "@/components/useRecorder";

describe("muted-microphone advice", () => {
  const windows = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154.0.0.0 Safari/537.36";
  const mac = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15";

  it("gives Windows-specific steps, including the mute key and privacy setting", () => {
    const steps = mutedAdvice(windows).join(" ");
    expect(steps).toMatch(/mute key/);
    expect(steps).toMatch(/Settings → System → Sound → Input/);
    expect(steps).toMatch(/Let desktop apps access your microphone/);
  });

  it("gives macOS steps and a generic fallback, always ending with the option to pick another microphone", () => {
    expect(mutedAdvice(mac).join(" ")).toMatch(/System Settings → Privacy & Security → Microphone/);
    expect(mutedAdvice("SomeOtherOS").join(" ")).toMatch(/system sound settings/);
    for (const ua of [windows, mac, "x"]) expect(mutedAdvice(ua).at(-1)).toMatch(/different microphone/);
  });
});

const okEnv = { isSecureContext: true, origin: "http://localhost:3000", hasGetUserMedia: true, hasMediaRecorder: true };

describe("microphone availability", () => {
  it("allows localhost and https pages in a capable browser", () => {
    expect(micSupportProblem(okEnv)).toBeNull();
  });

  it("explains the network-address problem instead of failing silently", () => {
    const msg = micSupportProblem({ ...okEnv, isSecureContext: false, origin: "http://192.168.0.224:3000" });
    expect(msg).toMatch(/only allow microphone access on https or on localhost/);
    expect(msg).toContain("http://192.168.0.224:3000");
    expect(msg).toContain("http://localhost:3000");
  });

  it("points to localhost on whatever port the app is actually using", () => {
    expect(micSupportProblem({ ...okEnv, isSecureContext: false, origin: "http://10.0.0.5:3111" })).toContain(
      "http://localhost:3111",
    );
    expect(micSupportProblem({ ...okEnv, isSecureContext: false, origin: "http://10.0.0.5" })).toContain("http://localhost ");
  });

  it("reports browsers that can't record audio", () => {
    expect(micSupportProblem({ ...okEnv, hasMediaRecorder: false })).toMatch(/can't record audio/);
    expect(micSupportProblem({ ...okEnv, hasGetUserMedia: false })).toMatch(/can't record audio/);
  });
});

describe("recorder helpers", () => {
  it("picks the first recording format the browser supports", () => {
    expect(pickMimeType(() => true)).toBe("audio/webm;codecs=opus");
    expect(pickMimeType((t) => t === "audio/mp4")).toBe("audio/mp4"); // Safari
    expect(pickMimeType(() => false)).toBeUndefined();
  });

  it("turns browser microphone errors into plain advice", () => {
    expect(describeMicError({ name: "NotAllowedError" })).toMatch(/blocked.*allow the microphone/i);
    expect(describeMicError({ name: "NotFoundError" })).toMatch(/No microphone was found/);
    expect(describeMicError({ name: "OverconstrainedError" })).toMatch(/isn't available any more/);
    expect(describeMicError({ name: "NotReadableError" })).toMatch(/another app/);
    expect(describeMicError(new Error("weird"))).toMatch(/Couldn't start the microphone/);
    expect(describeMicError(null)).toMatch(/Couldn't start the microphone/);
  });

  it("uses a silence threshold that is low but above zero", () => {
    expect(SILENCE_PEAK).toBeGreaterThan(0);
    expect(SILENCE_PEAK).toBeLessThan(0.1);
  });
});
