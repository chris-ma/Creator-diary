import { createClient } from "@/lib/supabase/server";
import type { Entry, EntryWithCollection } from "@/types";

export async function getPublishedEntriesByCollection(
  collectionId: string
): Promise<Entry[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("collection_id", collectionId)
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .order("date", { ascending: true });
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getEntryBySlug(
  collectionId: string,
  slug: string
): Promise<Entry | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("collection_id", collectionId)
      .eq("slug", slug)
      .eq("is_published", true)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getRecentPublishedEntries(
  limit = 6
): Promise<EntryWithCollection[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("entries")
      .select("*, collection:collections(id, title, slug)")
      .eq("is_published", true)
      .order("date", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []) as EntryWithCollection[];
  } catch {
    return [];
  }
}

// Admin: all entries regardless of publish state
export async function getAllEntries(): Promise<EntryWithCollection[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("entries")
      .select("*, collection:collections(id, title, slug)")
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as EntryWithCollection[];
  } catch {
    return [];
  }
}

export async function getEntryById(id: string): Promise<Entry | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

// Returns slugs of existing entries in a collection (for uniqueness check)
export async function getEntrySlugsByCollection(
  collectionId: string
): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("entries")
      .select("slug")
      .eq("collection_id", collectionId);
    if (error) return [];
    return (data ?? []).map((r) => r.slug);
  } catch {
    return [];
  }
}

// Prev/next within same collection for navigation
export async function getAdjacentEntries(
  collectionId: string,
  currentDisplayOrder: number
): Promise<{ prev: Entry | null; next: Entry | null }> {
  try {
    const supabase = await createClient();
    const [prevResult, nextResult] = await Promise.all([
      supabase
        .from("entries")
        .select("*")
        .eq("collection_id", collectionId)
        .eq("is_published", true)
        .lt("display_order", currentDisplayOrder)
        .order("display_order", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("entries")
        .select("*")
        .eq("collection_id", collectionId)
        .eq("is_published", true)
        .gt("display_order", currentDisplayOrder)
        .order("display_order", { ascending: true })
        .limit(1)
        .single(),
    ]);
    return {
      prev: prevResult.data ?? null,
      next: nextResult.data ?? null,
    };
  } catch {
    return { prev: null, next: null };
  }
}
