import type { Metadata } from "next";
import { Nav } from "@/components/public/Nav";
import { CollectionCard } from "@/components/public/CollectionCard";
import { getPublishedCollections } from "@/lib/queries/collections";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse all travel collections.",
};

export default async function CollectionsPage() {
  const collections = await getPublishedCollections();

  return (
    <div className="min-h-screen bg-paper">
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-xs tracking-widest uppercase text-ink-muted mb-12">
          Collections
        </h1>
        {collections.length === 0 ? (
          <p className="text-sm text-ink-muted">No collections yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            {collections.map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
