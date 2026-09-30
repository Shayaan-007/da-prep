import { describe, expect, it } from "vitest";
import { describeMicError, micSupportProblem, pickMimeType, SILENCE_PEAK } from "@/components/useRecorder";

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
