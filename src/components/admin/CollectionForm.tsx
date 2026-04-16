"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./ImageUploader";
import { RichTextEditor } from "./RichTextEditor";
import { Button } from "@/components/ui/Button";
import {
  createCollection,
  updateCollection,
  type CollectionFormData,
} from "@/lib/actions/collections";
import { requestCoverUploadUrl } from "@/lib/actions/entries";
import type { Collection } from "@/types";

type Props = {
  collection?: Collection;
};

export function CollectionForm({ collection }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [collectionId] = useState(
    () => collection?.id ?? crypto.randomUUID()
  );

  const [fields, setFields] = useState<CollectionFormData>({
    title: collection?.title ?? "",
    slug: collection?.slug ?? "",
    cover_image: collection?.cover_image ?? "",
    description: collection?.description ?? "",
    start_date: collection?.start_date ?? "",
    end_date: collection?.end_date ?? "",
    location_summary: collection?.location_summary ?? "",
    is_published: collection?.is_published ?? false,
  });

  function set<K extends keyof CollectionFormData>(
    key: K,
    value: CollectionFormData[K]
  ) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(publish: boolean) {
    if (!fields.title?.trim()) {
      setError("Title is required.");
      return;
    }
    setError(null);
    const data = { ...fields, is_published: publish };

    startTransition(async () => {
      if (collection) {
        const { error } = await updateCollection(collection.id, data);
        if (error) { setError(error); return; }
      } else {
        const { collection: created, error } = await createCollection(data);
        if (error || !created) { setError(error ?? "Unknown error"); return; }
      }
      router.push("/admin/collections");
    });
  }

  return (
    <div className="max-w-2xl space-y-8">
      <section className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Field label="Title">
            <input
              type="text"
              required
              placeholder="Japan Winter 2025"
              value={fields.title ?? ""}
              onChange={(e) => set("title", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Slug (auto-generated if blank)">
          <input
            type="text"
            placeholder="japan-winter-2025"
            value={fields.slug ?? ""}
            onChange={(e) => set("slug", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Location Summary">
          <input
            type="text"
            placeholder="Kyoto · Osaka · Nara"
            value={fields.location_summary ?? ""}
            onChange={(e) => set("location_summary", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Start Date">
          <input
            type="date"
            value={fields.start_date ?? ""}
            onChange={(e) => set("start_date", e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="End Date">
          <input
            type="date"
            value={fields.end_date ?? ""}
            onChange={(e) => set("end_date", e.target.value)}
            className={inputCls}
          />
        </Field>
      </section>

      <section>
        <h2 className="text-xs tracking-widest uppercase text-ink-muted mb-3">
          Cover Image
        </h2>
        <ImageUploader
          type="cover"
          resourceId={collectionId}
          currentPath={collection?.cover_image}
          onUploadComplete={(path) => set("cover_image", path)}
        />
      </section>

      <section>
        <Field label="Description (optional)">
          <RichTextEditor
            value={fields.description ?? ""}
            onChange={(html) => set("description", html)}
            placeholder="A quiet set of winter photographs…"
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
        <Button onClick={() => submit(true)} disabled={isPending}>
          {isPending ? "Saving…" : "Publish Collection"}
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
