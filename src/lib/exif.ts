import type { ExifData } from "@/types";

/**
 * Maps raw exifr output to our DB column names.
 * exifr returns different field names depending on file type/camera.
 */
export function mapExifToEntry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: Record<string, any>
): ExifData {
  const result: ExifData = {};

  // Camera body
  const make = raw.Make ?? raw.make ?? "";
  const model = raw.Model ?? raw.model ?? "";
  if (make || model) {
    result.camera_body = [make, model].filter(Boolean).join(" ").trim();
  }

  // Lens
  result.lens =
    raw.LensModel ??
    raw.lensModel ??
    raw.Lens ??
    raw.lens ??
    undefined;

  // Aperture (FNumber → "f/1.7")
  const fNumber = raw.FNumber ?? raw.fNumber ?? raw.ApertureValue ?? null;
  if (fNumber != null) {
    result.aperture = `f/${Number(fNumber).toFixed(1)}`;
  }

  // Shutter speed (ExposureTime → "1/500")
  const exposureTime = raw.ExposureTime ?? raw.exposureTime ?? null;
  if (exposureTime != null) {
    const val = Number(exposureTime);
    if (val >= 1) {
      result.shutter_speed = `${val}s`;
    } else {
      result.shutter_speed = `1/${Math.round(1 / val)}`;
    }
  }

  // ISO
  const iso = raw.ISO ?? raw.ISOSpeedRatings ?? raw.iso ?? null;
  if (iso != null) {
    result.iso = Number(iso);
  }

  // Focal length ("35mm")
  const focalLength = raw.FocalLength ?? raw.focalLength ?? null;
  if (focalLength != null) {
    result.focal_length = `${Math.round(Number(focalLength))}mm`;
  }

  // Date taken (ISO string "2024-11-03")
  const dateRaw =
    raw.DateTimeOriginal ??
    raw.dateTimeOriginal ??
    raw.DateTime ??
    raw.dateTime ??
    null;
  if (dateRaw) {
    const d = dateRaw instanceof Date ? dateRaw : new Date(dateRaw);
    if (!isNaN(d.getTime())) {
      result.date = d.toISOString().slice(0, 10);
    }
  }

  // Strip undefined values
  return Object.fromEntries(
    Object.entries(result).filter(([, v]) => v !== undefined)
  ) as ExifData;
}
