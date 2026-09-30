"use client";

import { useEffect, useState } from "react";
import { mutedAdvice } from "@/components/useRecorder";

/** Shown when the browser has the microphone but the computer is sending it no sound. */
export default function MutedNotice() {
  // Read the user agent after mount so server and browser render the same thing first.
  const [steps, setSteps] = useState<string[]>([]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSteps(mutedAdvice(navigator.userAgent));
  }, []);

  return (
    <div role="alert" className="callout space-y-2 bg-sun-50 text-sun-600">
      <p className="font-semibold">Your computer is reporting this microphone as muted, so no sound is reaching the site.</p>
      <p>
        The browser can see the microphone and has permission, but the system isn&apos;t sending it any audio. This
        isn&apos;t something the website can switch on. Try:
      </p>
      <ol className="list-decimal space-y-1 pl-5">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </div>
  );
}
