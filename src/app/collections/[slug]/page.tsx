import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/public/Nav";
import { EntryMeta } from "@/components/public/EntryMeta";
import { getCollectionBySlug } from "@/lib/queries/collections";
import { getPublishedEntriesByCollection } from "@/lib/queries/entries";
import { transformUrl, getPublicUrl } from "@/lib/storage";
import { collectionMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return collectionMetadata({
    title: collection.title,
    description: collection.description,
    coverImagePath: collection.cover_image,
  });
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const entries = await getPublishedEntriesByCollection(collection.id);

  const coverUrl = collection.cover_image
    ? transformUrl(collection.cover_image, 1600, 80)
    : null;

  const dateRange = [
    collection.start_date?.slice(0, 7),
    collection.end_date?.slice(0, 7),
  ]
    .filter(Boolean)
    .join(" – ");

  return (
    <div className="min-h-screen bg-paper">
      <Nav />

      {/* Cover */}
      {coverUrl && (
        <div className="relative w-full aspect-[16/7] overflow-hidden bg-paper-warm">
          <Image
            src={coverUrl}
            alt={collection.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 py-12 border-b border-ink/10">
        <Link
          href="/collections"
          className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors mb-6 inline-block"
        >
          ← Collections
        </Link>
        <h1 className="text-2xl font-light tracking-wide text-ink mt-4">
          {collection.title}
        </h1>
        {collection.location_summary && (
          <p className="text-sm text-ink-muted mt-1">
            {collection.location_summary}
          </p>
        )}
        {dateRange && (
          <p className="text-xs text-ink-muted mt-1">{dateRange}</p>
        )}
        {collection.description && (
          <p className="text-sm text-ink-light mt-4 max-w-xl leading-relaxed">
            {collection.description}
          </p>
        )}
      </div>

      {/* Entry feed */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {entries.length === 0 ? (
          <p className="text-sm text-ink-muted">No entries in this collection yet.</p>
        ) : (
          <div className="space-y-20">
            {entries.map((entry) => {
              const photoUrl = transformUrl(entry.photo_path, 1200);
              return (
                <article key={entry.id}>
                  <Link
                    href={`/collections/${collection.slug}/${entry.slug}`}
                    className="group block"
                  >
                    <div className="relative w-full aspect-[3/2] overflow-hidden bg-paper-warm mb-5">
                      <Image
                        src={photoUrl}
                        alt={entry.location_name ?? ""}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        sizes="(max-width: 1024px) 100vw, 900px"
                      />
                    </div>
                  </Link>
                  <EntryMeta entry={entry} />
                  {entry.description && (
                    <p className="text-sm text-ink-muted mt-3 max-w-xl leading-relaxed">
                      {entry.description}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
