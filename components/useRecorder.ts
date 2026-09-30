"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = "idle" | "starting" | "recording";

/**
 * Below this peak level the microphone picked up essentially nothing (muted, wrong device, nobody spoke).
 * Used only to word the message. Whether an answer counts as "heard" is decided by the transcript having text.
 */
export const SILENCE_PEAK = 0.03;

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

export function pickMimeType(isSupported: (t: string) => boolean): string | undefined {
  return MIME_CANDIDATES.find((t) => isSupported(t));
}

export function describeMicError(e: unknown): string {
  const name = (e as { name?: string })?.name;
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Microphone access is blocked. Click the camera or lock icon in your browser's address bar, allow the microphone, then try again.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "No microphone was found. Plug one in or check your system sound settings.";
  }
  if (name === "NotReadableError") {
    return "Your microphone is being used by another app. Close it and try again.";
  }
  return "Couldn't start the microphone.";
}

/**
 * Records the microphone with MediaRecorder and reports a live input level (0 to 1) so people can see the app is
 * actually hearing them. `stop()` resolves with the recording and the loudest level seen.
 */
export function useRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [level, setLevel] = useState(0);
  const [error, setError] = useState("");

  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const timer = useRef(0);
  const chunks = useRef<Blob[]>([]);
  const peak = useRef(0);

  const cleanup = useCallback(() => {
    window.clearInterval(timer.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    void ctx.current?.close().catch(() => {});
    ctx.current = null;
    recorder.current = null;
    setLevel(0);
    setState("idle");
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async (): Promise<boolean> => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("This browser can't record audio. Try Chrome, Edge, Firefox or Safari, or type your answer instead.");
      return false;
    }
    setState("starting");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      stream.current = s;
      chunks.current = [];
      peak.current = 0;

      const mimeType = pickMimeType((t) => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(s, mimeType ? { mimeType } : undefined);
      r.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      recorder.current = r;
      r.start(1000);

      // Live level meter from the raw input.
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = new AudioCtx();
      ctx.current = ac;
      // Some browsers (Safari especially) start the context suspended, which would leave the meter flat.
      void ac.resume().catch(() => {});
      const analyser = ac.createAnalyser();
      analyser.fftSize = 512;
      ac.createMediaStreamSource(s).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      // A timer, not requestAnimationFrame: animation frames stop entirely in background tabs, which would leave
      // the meter flat and the peak at zero if someone switches tab mid-answer.
      timer.current = window.setInterval(() => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) {
          const x = (v - 128) / 128;
          sum += x * x;
        }
        // Root-mean-square, lightly boosted so normal speech fills most of the meter.
        const rms = Math.min(1, Math.sqrt(sum / data.length) * 3);
        peak.current = Math.max(peak.current, rms);
        setLevel(rms);
      }, 80);

      setState("recording");
      return true;
    } catch (e) {
      cleanup();
      setError(describeMicError(e));
      return false;
    }
  }, [cleanup]);

  const stop = useCallback((): Promise<{ blob: Blob | null; peak: number }> => {
    const r = recorder.current;
    if (!r || r.state === "inactive") {
      cleanup();
      return Promise.resolve({ blob: null, peak: peak.current });
    }
    return new Promise((resolve) => {
      r.onstop = () => {
        const blob = chunks.current.length ? new Blob(chunks.current, { type: r.mimeType || "audio/webm" }) : null;
        const p = peak.current;
        cleanup();
        resolve({ blob, peak: p });
      };
      r.stop();
    });
  }, [cleanup]);

  return { state, level, error, start, stop };
}
