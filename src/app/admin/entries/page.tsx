import Link from "next/link";
import Image from "next/image";
import { getAllEntries } from "@/lib/queries/entries";
import { toggleEntryPublished, deleteEntry } from "@/lib/actions/entries";
import { getPublicUrl } from "@/lib/storage";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { OrderControls } from "@/components/admin/OrderControls";
import { Button } from "@/components/ui/Button";

export default async function AdminEntriesPage() {
  const entries = await getAllEntries();

  // Group by collection for order controls
  const byCollection = new Map<string, typeof entries>();
  for (const entry of entries) {
    const id = entry.collection_id;
    if (!byCollection.has(id)) byCollection.set(id, []);
    byCollection.get(id)!.push(entry);
  }
  // Sort each group by display_order
  for (const group of Array.from(byCollection.values())) {
    group.sort(
      (a: (typeof entries)[0], b: (typeof entries)[0]) =>
        a.display_order - b.display_order
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-light tracking-wide">Entries</h1>
        <Link href="/admin/entries/new">
          <Button>+ New Entry</Button>
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-ink-muted">No entries yet.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const group = byCollection.get(entry.collection_id) ?? [];
            const idx = group.findIndex((e) => e.id === entry.id);
            const prev = group[idx - 1];
            const next = group[idx + 1];

            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 border border-ink/10 bg-white px-4 py-3"
              >
                {/* Thumb */}
                {entry.photo_path ? (
                  <div className="relative w-14 h-10 flex-shrink-0 bg-paper-warm overflow-hidden">
                    <Image
                      src={getPublicUrl(entry.photo_path)}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-14 h-10 flex-shrink-0 bg-paper-warm" />
                )}

                {/* Meta */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink truncate">
                    {entry.location_name ?? "—"}
                    {entry.date ? (
                      <span className="text-ink-muted ml-2 text-xs">
                        {entry.date}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-ink-muted truncate">
                    {entry.collection?.title ?? "No collection"}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <OrderControls
                    id={entry.id}
                    displayOrder={entry.display_order}
                    prevId={prev?.id}
                    prevOrder={prev?.display_order}
                    nextId={next?.id}
                    nextOrder={next?.display_order}
                  />
                  <PublishToggle
                    id={entry.id}
                    isPublished={entry.is_published}
                    onToggle={toggleEntryPublished}
                  />
                  <Link
                    href={`/admin/entries/${entry.id}/edit`}
                    className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors"
                  >
                    Edit
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteEntry(entry.id);
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
            );
          })}
        </div>
      )}
    </div>
  );
}
