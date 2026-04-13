"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSignedUploadUrl, deleteFile } from "@/lib/storage";
import {
  generateEntrySlug,
  ensureUniqueSlug,
} from "@/lib/slugify";
import { getEntrySlugsByCollection } from "@/lib/queries/entries";
import type { Entry } from "@/types";

export type EntryFormData = {
  collection_id: string;
  photo_path?: string;
  date?: string;
  location_name?: string;
  country?: string;
  camera_body?: string;
  lens?: string;
  aperture?: string;
  shutter_speed?: string;
  iso?: number;
  focal_length?: string;
  description?: string;
  tags?: string[];
  display_order?: number;
  is_published?: boolean;
};

/**
 * Generates a signed upload URL for a new entry photo.
 * Called by the admin upload form before file upload begins.
 */
export async function requestUploadUrl(
  entryId: string
): Promise<{ signedUrl: string; path: string; error: string | null }> {
  const path = `entries/${entryId}/original.jpg`;
  try {
    const { signedUrl } = await getSignedUploadUrl(path);
    return { signedUrl, path, error: null };
  } catch (err) {
    return {
      signedUrl: "",
      path: "",
      error: err instanceof Error ? err.message : "Upload failed",
    };
  }
}

/**
 * Generates a signed upload URL for a collection cover image.
 */
export async function requestCoverUploadUrl(
  collectionId: string
): Promise<{ signedUrl: string; path: string; error: string | null }> {
  const path = `collections/${collectionId}/cover.jpg`;
  try {
    const { signedUrl } = await getSignedUploadUrl(path);
    return { signedUrl, path, error: null };
  } catch (err) {
    return {
      signedUrl: "",
      path: "",
      error: err instanceof Error ? err.message : "Upload failed",
    };
  }
}

export async function createEntry(
  formData: EntryFormData
): Promise<{ entry: Entry | null; error: string | null }> {
  const supabase = await createClient();

  // Generate a unique slug within the collection
  const baseSlug = generateEntrySlug(formData.location_name, formData.date);
  const existingSlugs = await getEntrySlugsByCollection(formData.collection_id);
  const slug = ensureUniqueSlug(baseSlug, existingSlugs);

  // Get max display_order in collection for appending at end
  const { data: maxOrderData } = await supabase
    .from("entries")
    .select("display_order")
    .eq("collection_id", formData.collection_id)
    .order("display_order", { ascending: false })
    .limit(1)
    .single();

  const displayOrder =
    formData.display_order ??
    ((maxOrderData?.display_order ?? -1) + 1);

  const { data, error } = await supabase
    .from("entries")
    .insert({
      collection_id: formData.collection_id,
      slug,
      photo_path: formData.photo_path ?? "",
      date: formData.date || null,
      location_name: formData.location_name?.trim() || null,
      country: formData.country?.trim() || null,
      camera_body: formData.camera_body?.trim() || null,
      lens: formData.lens?.trim() || null,
      aperture: formData.aperture?.trim() || null,
      shutter_speed: formData.shutter_speed?.trim() || null,
      iso: formData.iso ?? null,
      focal_length: formData.focal_length?.trim() || null,
      description: formData.description?.trim() || null,
      tags: formData.tags ?? [],
      display_order: displayOrder,
      is_published: formData.is_published ?? false,
    })
    .select()
    .single();

  if (error) return { entry: null, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/entries");
  revalidatePath(`/collections`);
  return { entry: data, error: null };
}

export async function updateEntry(
  id: string,
  formData: Partial<EntryFormData>
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (formData.photo_path !== undefined)
    updates.photo_path = formData.photo_path;
  if (formData.date !== undefined) updates.date = formData.date || null;
  if (formData.location_name !== undefined)
    updates.location_name = formData.location_name.trim() || null;
  if (formData.country !== undefined)
    updates.country = formData.country.trim() || null;
  if (formData.camera_body !== undefined)
    updates.camera_body = formData.camera_body.trim() || null;
  if (formData.lens !== undefined)
    updates.lens = formData.lens.trim() || null;
  if (formData.aperture !== undefined)
    updates.aperture = formData.aperture.trim() || null;
  if (formData.shutter_speed !== undefined)
    updates.shutter_speed = formData.shutter_speed.trim() || null;
  if (formData.iso !== undefined) updates.iso = formData.iso ?? null;
  if (formData.focal_length !== undefined)
    updates.focal_length = formData.focal_length.trim() || null;
  if (formData.description !== undefined)
    updates.description = formData.description.trim() || null;
  if (formData.tags !== undefined) updates.tags = formData.tags;
  if (formData.display_order !== undefined)
    updates.display_order = formData.display_order;
  if (formData.is_published !== undefined)
    updates.is_published = formData.is_published;
  if (formData.collection_id !== undefined)
    updates.collection_id = formData.collection_id;

  const { error } = await supabase
    .from("entries")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/entries");
  revalidatePath("/collections");
  return { error: null };
}

export async function deleteEntry(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from("entries")
    .select("photo_path, collection_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) return { error: error.message };

  if (entry?.photo_path) {
    try {
      await deleteFile(entry.photo_path);
    } catch {
      // Non-fatal
    }
  }

  revalidatePath("/admin/entries");
  revalidatePath("/collections");
  return { error: null };
}

export async function toggleEntryPublished(
  id: string,
  isPublished: boolean
): Promise<{ error: string | null }> {
  return updateEntry(id, { is_published: isPublished });
}

/**
 * Swaps display_order of two adjacent entries (for up/down reordering).
 */
export async function reorderEntries(
  idA: string,
  orderA: number,
  idB: string,
  orderB: number
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("swap_entry_order", {
    id_a: idA,
    order_a: orderA,
    id_b: idB,
    order_b: orderB,
  });

  // Fall back to two sequential updates if RPC not available
  if (error) {
    const { error: e1 } = await supabase
      .from("entries")
      .update({ display_order: orderB })
      .eq("id", idA);
    if (e1) return { error: e1.message };

    const { error: e2 } = await supabase
      .from("entries")
      .update({ display_order: orderA })
      .eq("id", idB);
    if (e2) return { error: e2.message };
  }

  revalidatePath("/admin/entries");
  revalidatePath("/collections");
  return { error: null };
}
