import Link from "next/link";
import Image from "next/image";
import { transformUrl } from "@/lib/storage";
import { EntryMeta } from "./EntryMeta";
import type { EntryWithCollection } from "@/types";

type Props = {
  entry: EntryWithCollection;
};

export function EntryCard({ entry }: Props) {
  const imageUrl = transformUrl(entry.photo_path, 600);
  const href = `/collections/${entry.collection.slug}/${entry.slug}`;

  return (
    <div className="flex gap-5 py-6 border-b border-ink/10 last:border-0">
      <Link href={href} className="group flex-shrink-0">
        <div className="relative w-28 h-20 overflow-hidden bg-paper-warm">
          <Image
            src={imageUrl}
            alt={entry.location_name ?? ""}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="112px"
          />
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <EntryMeta entry={entry} />
        {entry.description && (
          <div
            className="diary-prose diary-prose--muted mt-2 line-clamp-2 text-sm"
            dangerouslySetInnerHTML={{ __html: entry.description }}
          />
        )}
        {entry.collection && (
          <Link
            href={`/collections/${entry.collection.slug}`}
            className="text-xs text-ink-muted hover:text-ink mt-2 inline-block transition-colors"
          >
            {entry.collection.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
