import Image from "next/image";
import Link from "next/link";
import { Nav } from "@/components/public/Nav";
import { CollectionCard } from "@/components/public/CollectionCard";
import { EntryCard } from "@/components/public/EntryCard";
import { getPublishedCollections } from "@/lib/queries/collections";
import { getRecentPublishedEntries } from "@/lib/queries/entries";

export default async function HomePage() {
  const [collections, recentEntries] = await Promise.all([
    getPublishedCollections(),
    getRecentPublishedEntries(6),
  ]);

  const featuredCollections = collections.slice(0, 3);

  return (
    <div className="min-h-screen bg-paper">
      <Nav />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-light tracking-widest uppercase text-ink mb-4">
          Chris Ma
        </h1>
        <p className="text-sm text-ink-muted tracking-wide max-w-md mx-auto">
          A minimalist archive of places, moments, and light.
        </p>
      </section>

      {/* Featured Collections */}
      {featuredCollections.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="text-xs tracking-widest uppercase text-ink-muted mb-8">
            Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCollections.map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
          {collections.length > 3 && (
            <div className="mt-8">
              <Link
                href="/collections"
                className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors"
              >
                All Collections →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-24 border-t border-ink/10 pt-16">
          <h2 className="text-xs tracking-widest uppercase text-ink-muted mb-8">
            Recent
          </h2>
          <div className="max-w-xl">
            {recentEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {collections.length === 0 && recentEntries.length === 0 && (
        <section className="max-w-5xl mx-auto px-6 py-20 text-center">
          <p className="text-sm text-ink-muted">No entries published yet.</p>
        </section>
      )}
    </div>
  );
}
