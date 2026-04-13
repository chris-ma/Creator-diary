import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/public/Nav";
import { EntryMeta } from "@/components/public/EntryMeta";
import { TagList } from "@/components/public/TagList";
import { getCollectionBySlug } from "@/lib/queries/collections";
import {
  getEntryBySlug,
  getAdjacentEntries,
} from "@/lib/queries/entries";
import { transformUrl } from "@/lib/storage";
import { entryMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ slug: string; "entry-slug": string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, "entry-slug": entrySlug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  const entry = await getEntryBySlug(collection.id, entrySlug);
  if (!entry) return {};
  return entryMetadata({
    locationName: entry.location_name,
    date: entry.date,
    description: entry.description,
    photoPath: entry.photo_path,
  });
}

export default async function EntryDetailPage({ params }: Props) {
  const { slug, "entry-slug": entrySlug } = await params;

  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const entry = await getEntryBySlug(collection.id, entrySlug);
  if (!entry) notFound();

  const { prev, next } = await getAdjacentEntries(
    collection.id,
    entry.display_order
  );

  const photoUrl = transformUrl(entry.photo_path, 1600, 85);

  return (
    <div className="min-h-screen bg-paper">
      <Nav />

      {/* Top bar: back + prev/next */}
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between border-b border-ink/10">
        <Link
          href={`/collections/${collection.slug}`}
          className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors"
        >
          ← {collection.title}
        </Link>
        <div className="flex gap-4">
          {prev ? (
            <Link
              href={`/collections/${collection.slug}/${prev.slug}`}
              className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors"
            >
              ← Prev
            </Link>
          ) : (
            <span className="text-xs tracking-widest uppercase text-ink/20">
              Prev
            </span>
          )}
          {next ? (
            <Link
              href={`/collections/${collection.slug}/${next.slug}`}
              className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors"
            >
              Next →
            </Link>
          ) : (
            <span className="text-xs tracking-widest uppercase text-ink/20">
              Next
            </span>
          )}
        </div>
      </div>

      {/* Hero image */}
      <div className="relative w-full aspect-[3/2] bg-paper-warm">
        <Image
          src={photoUrl}
          alt={entry.location_name ?? ""}
          fill
          className="object-contain"
          priority
          sizes="100vw"
        />
      </div>

      {/* Metadata + description */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="max-w-lg">
          <EntryMeta entry={entry} />

          {entry.description && (
            <p className="text-sm text-ink-light mt-6 leading-relaxed">
              {entry.description}
            </p>
          )}

          <div className="mt-6 space-y-3">
            <p className="text-xs text-ink-muted">
              Collection:{" "}
              <Link
                href={`/collections/${collection.slug}`}
                className="hover:text-ink transition-colors"
              >
                {collection.title}
              </Link>
            </p>
            <TagList tags={entry.tags} />
          </div>
        </div>
      </div>
    </div>
  );
}
