import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { caseStudies } from "@/content/work";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ["", "/resume", ...caseStudies.map((c) => `/work/${c.slug}`)].map((path) => ({
    url: `${site.url}${path}`,
    lastModified,
  }));
}
