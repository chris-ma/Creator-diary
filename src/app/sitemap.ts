import type { MetadataRoute } from "next";
import { getPublishedCollections } from "@/lib/queries/collections";
import { getPublishedEntriesByCollection } from "@/lib/queries/entries";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const collections = await getPublishedCollections();

  const collectionUrls: MetadataRoute.Sitemap = collections.map((col) => ({
    url: `${SITE_URL}/collections/${col.slug}`,
    lastModified: col.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const entryUrls: MetadataRoute.Sitemap = [];
  for (const col of collections) {
    const entries = await getPublishedEntriesByCollection(col.id);
    for (const entry of entries) {
      entryUrls.push({
        url: `${SITE_URL}/collections/${col.slug}/${entry.slug}`,
        lastModified: entry.updated_at,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/collections`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/browse`, changeFrequency: "weekly", priority: 0.5 },
    ...collectionUrls,
    ...entryUrls,
  ];
}
