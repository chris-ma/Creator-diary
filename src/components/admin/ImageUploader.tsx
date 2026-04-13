"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { getPublicUrl } from "@/lib/storage";
import { mapExifToEntry } from "@/lib/exif";
import { requestUploadUrl, requestCoverUploadUrl } from "@/lib/actions/entries";
import type { ExifData } from "@/types";

type Props = {
  /** "entry" uploads to entries/{id}/original.jpg, "cover" to collections/{id}/cover.jpg */
  type: "entry" | "cover";
  resourceId: string;
  currentPath?: string | null;
  onUploadComplete: (path: string, exif?: ExifData) => void;
};

export function ImageUploader({
  type,
  resourceId,
  currentPath,
  onUploadComplete,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    currentPath ? getPublicUrl(currentPath) : null
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Extract EXIF client-side
    let exif: ExifData = {};
    try {
      // Dynamic import keeps exifr out of the main bundle
      const exifr = await import("exifr");
      const raw = await exifr.default.parse(file, {
        tiff: true,
        exif: true,
        iptc: false,
        xmp: false,
        icc: false,
      });
      if (raw) {
        exif = mapExifToEntry(raw);
      }
    } catch {
      // EXIF extraction is best-effort — continue without it
    }

    // Get a signed upload URL from the server
    const result =
      type === "entry"
        ? await requestUploadUrl(resourceId)
        : await requestCoverUploadUrl(resourceId);

    if (result.error || !result.signedUrl) {
      setError(result.error ?? "Upload failed");
      setUploading(false);
      return;
    }

    // Upload directly to Supabase Storage
    try {
      const res = await fetch(result.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }

      onUploadComplete(result.path, Object.keys(exif).length > 0 ? exif : undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border border-dashed border-ink/20 bg-paper-warm p-8 text-center cursor-pointer hover:border-ink/40 transition-colors"
      >
        {preview ? (
          <div className="relative w-full aspect-video">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <p className="text-xs tracking-widest uppercase text-ink-muted">
            {uploading ? "Uploading…" : "Drag image here or click to upload"}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/tiff"
        className="sr-only"
        onChange={handleInputChange}
      />

      {uploading && (
        <p className="text-xs text-ink-muted">Uploading and reading EXIF…</p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
