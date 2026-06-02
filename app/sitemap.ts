import type { MetadataRoute } from "next";

const SITE_URL = "https://www.myloanplans.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/loan`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/budget`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];
}
