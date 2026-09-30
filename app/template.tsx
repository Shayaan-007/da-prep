"use client";

import { usePathname } from "next/navigation";

// A template remounts on every navigation, so each page fades in instead of snapping.
// Ordinary pages get a centred content column; the home page lays out its own full-width bands.
export default function Template({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/") return <div className="animate-fade-up">{children}</div>;
  return <div className="animate-fade-up mx-auto w-full max-w-5xl px-4 py-10 sm:pb-14">{children}</div>;
}
