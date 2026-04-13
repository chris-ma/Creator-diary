import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/public/Nav";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Archive",
  description: "Browse all entries by date, location, and collection.",
};

type Entry = {
  id: string;
  slug: string;
  date: string | null;
  location_name: string | null;
  country: string | null;
  tags: string[];
  collection: { id: string; title: string; slug: string } | null;
};

async function getEntries(filters: {
  country?: string;
  tag?: string;
  collection_slug?: string;
}): Promise<Entry[]> {
  const supabase = await createClient();
  let query = supabase
    .from("entries")
    .select("id, slug, date, location_name, country, tags, collection:collections(id, title, slug)")
    .eq("is_published", true)
    .order("date", { ascending: false });

  if (filters.country) {
    query = query.ilike("country", filters.country);
  }
  if (filters.tag) {
    query = query.contains("tags", [filters.tag]);
  }
  if (filters.collection_slug) {
    const { data: col } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", filters.collection_slug)
      .single();
    if (col) query = query.eq("collection_id", col.id);
  }

  const { data } = await query;
  return ((data ?? []) as unknown) as Entry[];
}

type SearchParams = Promise<{
  country?: string;
  tag?: string;
  collection?: string;
}>;

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { country, tag, collection } = await searchParams;

  const entries = await getEntries({
    country,
    tag,
    collection_slug: collection,
  });

  // Group by month/year
  const grouped = new Map<string, Entry[]>();
  for (const entry of entries) {
    const key = entry.date
      ? new Date(entry.date + "T00:00:00").toLocaleDateString("en-AU", {
          month: "long",
          year: "numeric",
        })
      : "Unknown date";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  const hasFilters = country || tag || collection;

  return (
    <div className="min-h-screen bg-paper">
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-xs tracking-widest uppercase text-ink-muted mb-10">
          Archive
        </h1>

        {/* Filter bar */}
        <form method="GET" className="flex gap-4 flex-wrap mb-12">
          <input
            type="text"
            name="country"
            defaultValue={country ?? ""}
            placeholder="Country"
            className="border border-ink/20 bg-white px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-ink/60 transition-colors w-40"
          />
          <input
            type="text"
            name="tag"
            defaultValue={tag ?? ""}
            placeholder="Tag"
            className="border border-ink/20 bg-white px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-ink/60 transition-colors w-40"
          />
          <button
            type="submit"
            className="text-xs tracking-widest uppercase border border-ink/30 px-3 py-1.5 hover:border-ink/60 text-ink transition-colors"
          >
            Filter
          </button>
          {hasFilters && (
            <Link
              href="/browse"
              className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors self-center"
            >
              Clear
            </Link>
          )}
        </form>

        {/* Grouped results */}
        {grouped.size === 0 ? (
          <p className="text-sm text-ink-muted">No entries found.</p>
        ) : (
          <div className="space-y-10">
            {Array.from(grouped.entries()).map(([monthYear, items]) => (
              <section key={monthYear}>
                <h2 className="text-xs tracking-widest uppercase text-ink-muted border-b border-ink/10 pb-2 mb-4">
                  {monthYear}
                </h2>
                <ul className="space-y-2">
                  {items.map((entry) => (
                    <li key={entry.id}>
                      <Link
                        href={
                          entry.collection
                            ? `/collections/${entry.collection.slug}/${entry.slug}`
                            : "#"
                        }
                        className="flex items-baseline gap-3 group"
                      >
                        <span className="text-sm text-ink group-hover:text-ink-light transition-colors">
                          {entry.location_name ?? "Unknown location"}
                        </span>
                        {entry.collection && (
                          <span className="text-xs text-ink-muted">
                            {entry.collection.title}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
