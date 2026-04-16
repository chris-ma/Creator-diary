"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { RichTextEditor } from "./RichTextEditor";
import { Button } from "@/components/ui/Button";
import { createEntry, updateEntry, type EntryFormData } from "@/lib/actions/entries";
import type { Collection, Entry, ExifData } from "@/types";

type Props = {
  collections: Collection[];
  entry?: Entry;
  /** Pre-selected collection when creating from within a collection */
  defaultCollectionId?: string;
};

export function EntryForm({ collections, entry, defaultCollectionId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Stable ID for upload URL (use existing id or a new UUID)
  const [entryId] = useState(() => entry?.id ?? crypto.randomUUID());

  const [fields, setFields] = useState<EntryFormData>({
    collection_id: entry?.collection_id ?? defaultCollectionId ?? collections[0]?.id ?? "",
    photo_path: entry?.photo_path ?? "",
    date: entry?.date ?? "",
    location_name: entry?.location_name ?? "",
    country: entry?.country ?? "",
    camera_body: entry?.camera_body ?? "",
    lens: entry?.lens ?? "",
    aperture: entry?.aperture ?? "",
    shutter_speed: entry?.shutter_speed ?? "",
    iso: entry?.iso ?? undefined,
    focal_length: entry?.focal_length ?? "",
    description: entry?.description ?? "",
    tags: entry?.tags ?? [],
    is_published: entry?.is_published ?? false,
  });

  function set<K extends keyof EntryFormData>(
    key: K,
    value: EntryFormData[K]
  ) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleExif(exif: ExifData) {
    setFields((prev) => ({
      ...prev,
      camera_body: exif.camera_body ?? prev.camera_body,
      lens: exif.lens ?? prev.lens,
      aperture: exif.aperture ?? prev.aperture,
      shutter_speed: exif.shutter_speed ?? prev.shutter_speed,
      iso: exif.iso ?? prev.iso,
      focal_length: exif.focal_length ?? prev.focal_length,
      date: exif.date ?? prev.date,
    }));
  }

  function handleUploadComplete(path: string, exif?: ExifData) {
    set("photo_path", path);
    if (exif) handleExif(exif);
  }

  function handleTagInput(raw: string) {
    const tags = raw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    set("tags", tags);
  }

  async function submit(publish: boolean) {
    if (!fields.photo_path) {
      setError("Please upload a photo first.");
      return;
    }
    if (!fields.collection_id) {
      setError("Please select a collection.");
      return;
    }

    setError(null);
    const data = { ...fields, is_published: publish };

    startTransition(async () => {
      if (entry) {
        const { error } = await updateEntry(entry.id, data);
        if (error) { setError(error); return; }
      } else {
        const { error } = await createEntry(data);
        if (error) { setError(error); return; }
      }
      router.push("/admin/entries");
    });
  }

  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="text-xs tracking-widest uppercase text-ink-muted mb-3">
          Photo
        </h2>
        <ImageUploader
          type="entry"
          resourceId={entryId}
          currentPath={entry?.photo_path}
          onUploadComplete={handleUploadComplete}
        />
      </section>

      <section className="grid grid-cols-2 gap-4">
        <Field label="Date Taken">
          <input
            type="date"
            value={fields.date ?? ""}
            onChange={(e) => set("date", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Collection">
          <select
            value={fields.collection_id}
            onChange={(e) => set("collection_id", e.target.value)}
            className={inputCls}
          >
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Location">
          <input
            type="text"
            placeholder="Kyoto, Japan"
            value={fields.location_name ?? ""}
            onChange={(e) => set("location_name", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Country">
          <input
            type="text"
            placeholder="Japan"
            value={fields.country ?? ""}
            onChange={(e) => set("country", e.target.value)}
            className={inputCls}
          />
        </Field>
      </section>

      <section>
        <h2 className="text-xs tracking-widest uppercase text-ink-muted mb-3">
          Camera
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Camera Body">
            <input
              type="text"
              placeholder="Sony A7IV"
              value={fields.camera_body ?? ""}
              onChange={(e) => set("camera_body", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Lens">
            <input
              type="text"
              placeholder="35mm f/1.8"
              value={fields.lens ?? ""}
              onChange={(e) => set("lens", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Aperture">
            <input
              type="text"
              placeholder="f/2.0"
              value={fields.aperture ?? ""}
              onChange={(e) => set("aperture", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Shutter Speed">
            <input
              type="text"
              placeholder="1/500"
              value={fields.shutter_speed ?? ""}
              onChange={(e) => set("shutter_speed", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="ISO">
            <input
              type="number"
              placeholder="200"
              value={fields.iso ?? ""}
              onChange={(e) =>
                set("iso", e.target.value ? Number(e.target.value) : undefined)
              }
              className={inputCls}
            />
          </Field>
          <Field label="Focal Length">
            <input
              type="text"
              placeholder="35mm"
              value={fields.focal_length ?? ""}
              onChange={(e) => set("focal_length", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      <section>
        <Field label="Tags (comma-separated)">
          <input
            type="text"
            placeholder="street, golden hour, travel"
            defaultValue={(fields.tags ?? []).join(", ")}
            onChange={(e) => handleTagInput(e.target.value)}
            className={inputCls}
          />
        </Field>
      </section>

      <section>
        <Field label="Description (optional)">
          <RichTextEditor
            value={fields.description ?? ""}
            onChange={(html) => set("description", html)}
            placeholder="A brief diary note about this moment…"
          />
        </Field>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button
          variant="secondary"
          onClick={() => submit(false)}
          disabled={isPending}
        >
          Save Draft
        </Button>
        <Button
          onClick={() => submit(true)}
          disabled={isPending}
        >
          {isPending ? "Saving…" : "Publish Entry"}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase text-ink-muted mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-ink/20 bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink/60 transition-colors";
