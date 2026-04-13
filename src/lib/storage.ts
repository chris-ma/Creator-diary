// Pure URL utilities — safe to import from client components.
// Server-only storage functions (getSignedUploadUrl, deleteFile) live in storage.server.ts

export const BUCKET = "travel-diary";

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
