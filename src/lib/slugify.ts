/**
 * Converts a string to a URL-safe slug.
 * e.g. "Kyoto, Japan" → "kyoto-japan"
 */
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Generates a slug for an entry from its location and date.
 * e.g. ("Kyoto, Japan", "2024-11-03") → "kyoto-japan-2024-11-03"
 */
export function generateEntrySlug(
  locationName: string | null | undefined,
  date: string | null | undefined
): string {
  const parts: string[] = [];
  if (locationName) parts.push(toSlug(locationName));
  if (date) parts.push(date.slice(0, 10)); // YYYY-MM-DD
  if (parts.length === 0) parts.push(crypto.randomUUID().slice(0, 8));
  return parts.join("-");
}

/**
 * Generates a slug for a collection from its title.
 * e.g. "Japan Winter 2025" → "japan-winter-2025"
 */
export function generateCollectionSlug(title: string): string {
  return toSlug(title);
}

/**
 * Ensures a slug is unique within a given set of existing slugs.
 * Appends a numeric suffix if necessary.
 */
export function ensureUniqueSlug(
  base: string,
  existingSlugs: string[]
): string {
  if (!existingSlugs.includes(base)) return base;
  let counter = 2;
  while (existingSlugs.includes(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}
