import Link from "next/link";
import Image from "next/image";
import { getAllCollections } from "@/lib/queries/collections";
import {
  toggleCollectionPublished,
  deleteCollection,
} from "@/lib/actions/collections";
import { getPublicUrl } from "@/lib/storage";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { Button } from "@/components/ui/Button";

export default async function AdminCollectionsPage() {
  const collections = await getAllCollections();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-light tracking-wide">Collections</h1>
        <Link href="/admin/collections/new">
          <Button>+ New Collection</Button>
        </Link>
      </div>

      {collections.length === 0 ? (
        <p className="text-sm text-ink-muted">No collections yet.</p>
      ) : (
        <div className="space-y-3">
          {collections.map((col) => (
            <div
              key={col.id}
              className="flex items-center gap-4 border border-ink/10 bg-white px-4 py-3"
            >
              {/* Thumb */}
              {col.cover_image ? (
                <div className="relative w-16 h-10 flex-shrink-0 bg-paper-warm overflow-hidden">
                  <Image
                    src={getPublicUrl(col.cover_image)}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-16 h-10 flex-shrink-0 bg-paper-warm" />
              )}

              {/* Meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink">{col.title}</p>
                <p className="text-xs text-ink-muted">
                  {col.location_summary ?? ""}
                  {col.start_date ? ` · ${col.start_date.slice(0, 7)}` : ""}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <PublishToggle
                  id={col.id}
                  isPublished={col.is_published}
                  onToggle={toggleCollectionPublished}
                />
                <Link
                  href={`/admin/collections/${col.id}/edit`}
                  className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors"
                >
                  Edit
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await deleteCollection(col.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs tracking-widest uppercase text-red-400 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
