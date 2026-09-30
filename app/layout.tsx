import type { Metadata } from "next";
import Link from "next/link";
import AuthProvider from "@/components/AuthProvider";
import BottomNav from "@/components/BottomNav";
import Nav from "@/components/Nav";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { Figtree } from "next/font/google";
import "./globals.css";

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "DA Prep: prepare for your degree apprenticeship", template: "%s | DA Prep" },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "DA Prep: prepare for your degree apprenticeship",
    description: SITE_DESCRIPTION,
    locale: "en_GB",
  },
  twitter: { card: "summary" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-ink">
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <AuthProvider>
          <Nav />
          <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 pb-28 sm:pb-12">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
        <footer className="border-t border-line bg-white py-6 text-xs text-muted">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
            <p>Guidance only. Always check the employer&apos;s own process and dates.</p>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-1">
              {[
                ["/guide", "Guide"],
                ["/tips", "Tips"],
                ["/timeline", "Timeline"],
                ["/faq", "FAQ"],
                ["/pricing", "Plans"],
                ["/privacy", "Privacy"],
                ["/terms", "Terms"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="hover:text-ink hover:underline">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
