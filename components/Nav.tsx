"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const links = [
  { href: "/interview", label: "Interview" },
  { href: "/practice", label: "Tests" },
  { href: "/review", label: "Review" },
  { href: "/tracker", label: "Tracker" },
  { href: "/stories", label: "Stories" },
  { href: "/progress", label: "Progress" },
  { href: "/sectors", label: "Sectors" },
  { href: "/guide", label: "Guide" },
  { href: "/employers", label: "Employers" },
];

export default function Nav() {
  const { enabled, user } = useAuth();
  const path = usePathname();
  const active = (href: string) => path === href || path.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5" aria-label="Main">
        <Link href="/" className="mr-2 flex shrink-0 items-center gap-2 font-extrabold tracking-tight">
          <span className="display grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-xs text-white shadow-md shadow-brand-500/30">
            DA
          </span>
          <span className="display hidden sm:inline">Prep</span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm [scrollbar-width:none]">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active(l.href) ? "page" : undefined}
              className={`shrink-0 rounded-lg px-3 py-1.5 font-medium transition-colors ${
                active(l.href) ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-brand-50/60 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        {enabled && (
          <Link href="/login" className="btn btn-secondary shrink-0 !px-3 !py-1.5">
            {user ? "Account" : "Sign in"}
          </Link>
        )}
      </nav>
    </header>
  );
}
