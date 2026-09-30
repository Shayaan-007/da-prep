"use client";

import { useEffect, useRef, useState } from "react";

/** Local self-view so you can practise eye contact and framing. Nothing is recorded or uploaded. */
export default function CameraPreview() {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [on, setOn] = useState(false);
  const [error, setError] = useState("");

  function stop() {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setOn(false);
  }

  async function start() {
    setError("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.current = s;
      setOn(true);
      requestAnimationFrame(() => {
        if (video.current) video.current.srcObject = s;
      });
    } catch {
      setError("Couldn't access the camera. Check your browser permissions.");
    }
  }

  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);

  return (
    <div className="space-y-2">
      {on && (
        <video
          ref={video}
          autoPlay
          muted
          playsInline
          className="w-full max-w-xs -scale-x-100 rounded-2xl bg-ink"
          aria-label="Camera self-view"
        />
      )}
      <button
        type="button"
        onClick={on ? stop : start}
        className="text-sm text-muted underline"
      >
        {on ? "Turn camera off" : "Show camera self-view (not recorded)"}
      </button>
      {error && <p className="text-sm text-coral-600">{error}</p>}
    </div>
  );
}
