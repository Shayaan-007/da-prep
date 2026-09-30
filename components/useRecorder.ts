"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { diag } from "@/lib/diag";

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

/**
 * Why this page can't use a microphone at all, or null if it can. Browsers only allow microphone access on https or
 * on localhost, so opening the dev server by its network address (e.g. http://192.168.x.x:3000) silently fails.
 */
export function micSupportProblem(env?: {
  isSecureContext: boolean;
  origin: string;
  hasGetUserMedia: boolean;
  hasMediaRecorder: boolean;
}): string | null {
  const e =
    env ??
    (typeof window === "undefined"
      ? null
      : {
          isSecureContext: window.isSecureContext,
          origin: window.location.origin,
          hasGetUserMedia: Boolean(navigator.mediaDevices?.getUserMedia),
          hasMediaRecorder: typeof MediaRecorder !== "undefined",
        });
  if (!e) return null;
  if (!e.isSecureContext) {
    let port = "";
    try {
      port = new URL(e.origin).port;
    } catch {
      /* keep the plain localhost address */
    }
    return `Browsers only allow microphone access on https or on localhost, and you're on ${e.origin}. Open the site at http://localhost${port ? `:${port}` : ""} (or its https address) instead.`;
  }
  if (!e.hasGetUserMedia || !e.hasMediaRecorder) {
    return "This browser can't record audio. Use a recent version of Chrome, Edge, Firefox or Safari.";
  }
  return null;
}

export function describeMicError(e: unknown): string {
  const name = (e as { name?: string })?.name;
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Microphone access is blocked. Click the camera or lock icon in your browser's address bar, allow the microphone, then try again.";
  }
  if (name === "OverconstrainedError") {
    return "That microphone isn't available any more. Choose another one, or pick the default.";
  }
  if (name === "NotFoundError") {
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
  const [deviceLabel, setDeviceLabel] = useState("");

  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const timer = useRef(0);
  const chunks = useRef<Blob[]>([]);
  const peak = useRef(0);
  const stats = useRef({ sum: 0, frames: 0, loud: 0, startedAt: 0 });

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

  /** `deviceId` picks a specific microphone; leave it out to use the system default. */
  const start = useCallback(async (deviceId?: string): Promise<boolean> => {
    setError("");
    setDeviceLabel("");
    diag("mic-start", {
      device: deviceId ? "specific" : "default",
      secure: window.isSecureContext,
      origin: window.location.origin,
      ua: navigator.userAgent.slice(0, 140),
    });
    // Permission state, logged when it resolves. Not awaited, so it can't delay the microphone request.
    void navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((p) => diag("mic-permission", { state: p.state }))
      .catch(() => {});
    const problem = micSupportProblem();
    if (problem) {
      diag("mic-unavailable", { reason: problem.slice(0, 80) });
      setError(problem);
      return false;
    }
    setState("starting");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: {
          ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const track = s.getAudioTracks()[0];
      const settings = track?.getSettings?.() ?? {};
      diag("mic-open", {
        label: track?.label,
        muted: track?.muted,
        readyState: track?.readyState,
        sampleRate: settings.sampleRate,
        channels: settings.channelCount,
        echoCancellation: settings.echoCancellation,
        noiseSuppression: settings.noiseSuppression,
        autoGainControl: settings.autoGainControl,
      });
      if (track) {
        track.onmute = () => diag("track-muted");
        track.onunmute = () => diag("track-unmuted");
        track.onended = () => diag("track-ended");
      }
      setDeviceLabel(track?.label ?? "");
      stream.current = s;
      chunks.current = [];
      peak.current = 0;
      stats.current = { sum: 0, frames: 0, loud: 0, startedAt: Date.now() };

      const mimeType = pickMimeType((t) => MediaRecorder.isTypeSupported(t));
      const r = new MediaRecorder(s, mimeType ? { mimeType } : undefined);
      r.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      r.onerror = () => diag("recorder-error");
      recorder.current = r;
      r.start(1000);
      diag("recorder-started", { mimeType: r.mimeType, requested: mimeType ?? "browser default" });

      // Live level meter from the raw input.
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ac = new AudioCtx();
      ctx.current = ac;
      // Some browsers (Safari especially) start the context suspended, which would leave the meter flat.
      void ac.resume().catch(() => {});
      window.setTimeout(() => diag("audio-context", { state: ac.state }), 600);
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
        stats.current.sum += rms;
        stats.current.frames += 1;
        if (rms > 0.06) stats.current.loud += 1;
        setLevel(rms);
      }, 80);

      setState("recording");
      return true;
    } catch (e) {
      diag("mic-error", { name: (e as Error)?.name, message: String((e as Error)?.message ?? e).slice(0, 120) });
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
        const st = stats.current;
        diag("recorder-stopped", {
          seconds: +((Date.now() - st.startedAt) / 1000).toFixed(1),
          chunks: chunks.current.length,
          bytes: blob?.size ?? 0,
          type: blob?.type,
          peakPct: Math.round(p * 100),
          avgPct: st.frames ? Math.round((st.sum / st.frames) * 100) : 0,
          loudFramesPct: st.frames ? Math.round((st.loud / st.frames) * 100) : 0,
        });
        cleanup();
        resolve({ blob, peak: p });
      };
      r.stop();
    });
  }, [cleanup]);

  return { state, level, error, deviceLabel, start, stop };
}
