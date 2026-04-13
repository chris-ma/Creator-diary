import { createClient } from "@/lib/supabase/server";

const BUCKET = "travel-diary";
const TRANSFORM_ENABLED =
  process.env.NEXT_PUBLIC_SUPABASE_TRANSFORM_ENABLED === "true";

/**
 * Returns the public CDN URL for a given storage path.
 * Always use this instead of constructing URLs manually — if the storage
 * config changes, only this function needs updating.
 */
export function getPublicUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}

/**
 * Returns an optimized image URL.
 * On Supabase Pro (TRANSFORM_ENABLED=true), appends transformation params.
 * On free tier, returns the original URL unchanged.
 */
export function transformUrl(
  path: string,
  width: number,
  quality = 80
): string {
  if (!TRANSFORM_ENABLED) return getPublicUrl(path);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/render/image/public/${BUCKET}/${path}?width=${width}&quality=${quality}`;
}

/**
 * Generates a signed upload URL for direct browser-to-Supabase uploads.
 * Must be called server-side (Server Action).
 * Returns the signed URL and the final storage path.
 */
export async function getSignedUploadUrl(
  path: string
): Promise<{ signedUrl: string; token: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(`Failed to create signed upload URL: ${error?.message}`);
  }

  return { signedUrl: data.signedUrl, token: data.token };
}

/**
 * Deletes a file from storage.
 * Must be called server-side.
 */
export async function deleteFile(path: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
