import type { MetadataRoute } from "next";
import { TESTS } from "@/lib/assess/tests";
import { FIRMS } from "@/lib/firms";
import { SECTOR_IDS } from "@/lib/sectors";
import { PUBLIC_PATHS, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...PUBLIC_PATHS,
    ...SECTOR_IDS.map((id) => `/sectors/${id}`),
    ...FIRMS.map((f) => `/employers/${f.slug}`),
    ...TESTS.map((t) => `/tests/${t.id}`),
  ];
  return paths.map((p) => ({
    url: `${SITE_URL}${p === "/" ? "" : p}`,
    changeFrequency: p === "/" ? "weekly" : "monthly",
    priority: p === "/" ? 1 : 0.7,
  }));
}
