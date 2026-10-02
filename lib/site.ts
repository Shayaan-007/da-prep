/** Canonical site URL for metadata, sitemap and robots. Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Level6";
export const SITE_DESCRIPTION =
  "AI mock interviews, practice tests and an application tracker for UK degree apprenticeships.";

/** Public, indexable pages. Personal tools (tracker, stories, progress, account) are excluded. */
export const PUBLIC_PATHS = [
  "/",
  "/interview",
  "/practice",
  "/tests",
  "/mock",
  "/review",
  "/sectors",
  "/guide",
  "/learn",
  "/tips",
  "/timeline",
  "/employers",
  "/faq",
  "/pricing",
  "/privacy",
  "/terms",
];
