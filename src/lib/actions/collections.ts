"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateCollectionSlug, ensureUniqueSlug } from "@/lib/slugify";
import { deleteFile } from "@/lib/storage";
import type { Collection } from "@/types";

export type CollectionFormData = {
  title: string;
  slug?: string;
  cover_image?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location_summary?: string;
  is_published?: boolean;
  display_order?: number;
};

export async function createCollection(
  formData: CollectionFormData
): Promise<{ collection: Collection | null; error: string | null }> {
  const supabase = await createClient();

  // Auto-generate slug if not provided
  let slug = formData.slug?.trim() || generateCollectionSlug(formData.title);

  // Check for existing slugs to ensure uniqueness
  const { data: existing } = await supabase
    .from("collections")
    .select("slug");
  const existingSlugs = (existing ?? []).map((r) => r.slug);
  slug = ensureUniqueSlug(slug, existingSlugs);

  const { data, error } = await supabase
    .from("collections")
    .insert({
      title: formData.title.trim(),
      slug,
      cover_image: formData.cover_image || null,
      description: formData.description?.trim() || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      location_summary: formData.location_summary?.trim() || null,
      is_published: formData.is_published ?? false,
      display_order: formData.display_order ?? 0,
    })
    .select()
    .single();

  if (error) return { collection: null, error: error.message };

  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/admin/collections");
  return { collection: data, error: null };
}

export async function updateCollection(
  id: string,
  formData: Partial<CollectionFormData>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (formData.title !== undefined) updates.title = formData.title.trim();
  if (formData.slug !== undefined) updates.slug = formData.slug.trim();
  if (formData.cover_image !== undefined)
    updates.cover_image = formData.cover_image || null;
  if (formData.description !== undefined)
    updates.description = formData.description.trim() || null;
  if (formData.start_date !== undefined)
    updates.start_date = formData.start_date || null;
  if (formData.end_date !== undefined)
    updates.end_date = formData.end_date || null;
  if (formData.location_summary !== undefined)
    updates.location_summary = formData.location_summary.trim() || null;
  if (formData.is_published !== undefined)
    updates.is_published = formData.is_published;
  if (formData.display_order !== undefined)
    updates.display_order = formData.display_order;

  const { error } = await supabase
    .from("collections")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/admin/collections");
  return { error: null };
}

export async function deleteCollection(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Get cover image path before deletion for storage cleanup
  const { data: collection } = await supabase
    .from("collections")
    .select("cover_image")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  // Clean up cover image from storage
  if (collection?.cover_image) {
    try {
      await deleteFile(collection.cover_image);
    } catch {
      // Non-fatal — log in production
    }
  }

  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/admin/collections");
  return { error: null };
}

export async function toggleCollectionPublished(
  id: string,
  isPublished: boolean
): Promise<{ error: string | null }> {
  return updateCollection(id, { is_published: isPublished });
}
