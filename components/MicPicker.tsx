"use client";

import { useEffect, useState } from "react";

/**
 * Lets people choose which microphone to use. The most common reason nothing is heard is that the system default
 * input is the wrong device (a webcam with no mic, a muted headset, a virtual device), so the choice is made visible.
 * Device names only appear after the browser has granted microphone permission once.
 */
export default function MicPicker({
  value,
  onChange,
  refreshKey = 0,
}: {
  value: string;
  onChange: (id: string) => void;
  /** Change this (e.g. after a successful microphone test) to re-read the device list with names. */
  refreshKey?: number;
}) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const md = typeof navigator === "undefined" ? undefined : navigator.mediaDevices;
    if (!md?.enumerateDevices) return;
    let cancelled = false;
    const load = async () => {
      try {
        const all = await md.enumerateDevices();
        if (!cancelled) setDevices(all.filter((d) => d.kind === "audioinput" && d.deviceId));
      } catch {
        /* no device list available: the default microphone still works */
      }
    };
    void load();
    md.addEventListener?.("devicechange", load);
    return () => {
      cancelled = true;
      md.removeEventListener?.("devicechange", load);
    };
  }, [refreshKey]);

  const named = devices.some((d) => d.label);
  // If the saved choice has been unplugged, fall back to the default in the UI.
  const current = devices.some((d) => d.deviceId === value) ? value : "";

  return (
    <div className="space-y-1">
      <label className="label" htmlFor="mic-picker">
        Microphone
      </label>
      <select
        id="mic-picker"
        className="input max-w-sm"
        value={current}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Default microphone</option>
        {named &&
          devices.map((d, i) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Microphone ${i + 1}`}
            </option>
          ))}
      </select>
      {!named && (
        <p className="text-xs text-muted">Run the test below once to see your microphones by name and pick the right one.</p>
      )}
    </div>
  );
}
