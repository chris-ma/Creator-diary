// Server-only storage functions. Do NOT import from client components.
import { createClient } from "@/lib/supabase/server";
import { BUCKET } from "@/lib/storage";

/**
 * Generates a signed upload URL for direct browser-to-Supabase uploads.
 * Must be called server-side (Server Action).
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
