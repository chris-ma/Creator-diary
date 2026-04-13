import { createClient } from "@/lib/supabase/server";
import type { Collection } from "@/types";

export async function getPublishedCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCollectionBySlug(
  slug: string
): Promise<Collection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) return null;
  return data;
}

// Admin: get all collections regardless of publish state
export async function getAllCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCollectionById(
  id: string
): Promise<Collection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
