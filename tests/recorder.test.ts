import { describe, expect, it } from "vitest";
import { describeMicError, pickMimeType, SILENCE_PEAK } from "@/components/useRecorder";

describe("recorder helpers", () => {
  it("picks the first recording format the browser supports", () => {
    expect(pickMimeType(() => true)).toBe("audio/webm;codecs=opus");
    expect(pickMimeType((t) => t === "audio/mp4")).toBe("audio/mp4"); // Safari
    expect(pickMimeType(() => false)).toBeUndefined();
  });

  it("turns browser microphone errors into plain advice", () => {
    expect(describeMicError({ name: "NotAllowedError" })).toMatch(/blocked.*allow the microphone/i);
    expect(describeMicError({ name: "NotFoundError" })).toMatch(/No microphone was found/);
    expect(describeMicError({ name: "NotReadableError" })).toMatch(/another app/);
    expect(describeMicError(new Error("weird"))).toMatch(/Couldn't start the microphone/);
    expect(describeMicError(null)).toMatch(/Couldn't start the microphone/);
  });

  it("uses a silence threshold that is low but above zero", () => {
    expect(SILENCE_PEAK).toBeGreaterThan(0);
    expect(SILENCE_PEAK).toBeLessThan(0.1);
  });
});
