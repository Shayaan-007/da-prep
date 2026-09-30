import type { Metadata } from "next";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";
import BottomNav from "@/components/BottomNav";
import Nav from "@/components/Nav";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";

const heading = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DA Prep",
  description:
    "AI mock interviews, practice tests and an application tracker for UK degree apprenticeships.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-ink">
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <AuthProvider>
          <Nav />
          <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 pb-28 sm:pb-10">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
        <footer className="border-t border-line bg-white/60 py-6 text-center text-xs text-muted">
          Guidance only. Always check the employer&apos;s own process and dates. ·{" "}
          <Link href="/pricing" className="underline hover:text-ink">Plans</Link> ·{" "}
          <Link href="/faq" className="underline hover:text-ink">FAQ</Link> ·{" "}
          <Link href="/privacy" className="underline hover:text-ink">Privacy</Link>
        </footer>
      </body>
    </html>
  );
}
