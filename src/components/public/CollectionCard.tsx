import Link from "next/link";
import Image from "next/image";
import { transformUrl } from "@/lib/storage";
import type { Collection } from "@/types";

type Props = {
  collection: Collection;
};

export function CollectionCard({ collection }: Props) {
  const imageUrl = collection.cover_image
    ? transformUrl(collection.cover_image, 800)
    : null;

  const dateRange = [
    collection.start_date?.slice(0, 7),
    collection.end_date?.slice(0, 7),
  ]
    .filter(Boolean)
    .join(" – ");

  return (
    <Link href={`/collections/${collection.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-warm mb-3">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={collection.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 bg-paper-warm" />
        )}
      </div>
      <h3 className="text-sm font-light tracking-wide text-ink group-hover:text-ink-light transition-colors">
        {collection.title}
      </h3>
      {(dateRange || collection.location_summary) && (
        <p className="text-xs text-ink-muted mt-1 space-x-1">
          {collection.location_summary && (
            <span>{collection.location_summary}</span>
          )}
          {dateRange && collection.location_summary && <span>·</span>}
          {dateRange && <span>{dateRange}</span>}
        </p>
      )}
    </Link>
  );
}
