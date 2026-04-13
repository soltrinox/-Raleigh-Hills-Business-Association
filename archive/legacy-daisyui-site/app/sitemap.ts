import type { MetadataRoute } from "next";
import { getContentManifest } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.vercel.app";
  const m = getContentManifest();
  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/calendar`, changeFrequency: "weekly", priority: 0.8 },
  ];
  for (const p of m.pages) {
    if (p.path.length === 0) continue;
    const path = p.path.join("/");
    urls.push({
      url: `${base}/${path}`,
      lastModified: m.generatedAt ? new Date(m.generatedAt) : undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  return urls;
}
