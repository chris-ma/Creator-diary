import type { Metadata } from "next";
import { getPublicUrl, transformUrl } from "@/lib/storage";

/** Strip HTML tags from a rich-text description for use in OG meta tags. */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const SITE_NAME = "Travel Photo Diary";
const SITE_DESCRIPTION =
  "A minimalist archive of places, moments, and light.";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export function baseMetadata(): Metadata {
  return {
    metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
    title: {
      default: SITE_NAME,
      template: `%s — ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
      siteName: SITE_NAME,
      type: "website",
      locale: "en_AU",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export function collectionMetadata(opts: {
  title: string;
  description?: string | null;
  coverImagePath?: string | null;
}): Metadata {
  const imageUrl = opts.coverImagePath
    ? transformUrl(opts.coverImagePath, 1200, 80)
    : undefined;
  return {
    title: opts.title,
    description: opts.description ? stripHtml(opts.description) : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description ? stripHtml(opts.description) : undefined,
      type: "website",
      images: imageUrl ? [{ url: imageUrl, width: 1200 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description ? stripHtml(opts.description) : undefined,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export function entryMetadata(opts: {
  locationName?: string | null;
  date?: string | null;
  description?: string | null;
  photoPath: string;
}): Metadata {
  const title = [opts.locationName, opts.date]
    .filter(Boolean)
    .join(" · ");
  const imageUrl = transformUrl(opts.photoPath, 1200, 80);
  return {
    title: title || "Entry",
    description: opts.description ? stripHtml(opts.description) : undefined,
    openGraph: {
      title: title || "Entry",
      description: opts.description ? stripHtml(opts.description) : undefined,
      type: "article",
      images: [{ url: imageUrl, width: 1200 }],
    },
    twitter: {
      card: "summary_large_image",
      title: title || "Entry",
      images: [imageUrl],
    },
  };
}

// Re-export for convenience
export { getPublicUrl, transformUrl };
