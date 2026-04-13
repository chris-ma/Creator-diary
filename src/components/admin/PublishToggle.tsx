"use client";

import { useState, useTransition } from "react";

type Props = {
  id: string;
  isPublished: boolean;
  onToggle: (id: string, value: boolean) => Promise<{ error: string | null }>;
};

export function PublishToggle({ id, isPublished, onToggle }: Props) {
  const [published, setPublished] = useState(isPublished);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next = !published;
    setPublished(next);
    startTransition(async () => {
      const { error } = await onToggle(id, next);
      if (error) setPublished(!next); // revert on error
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`text-xs tracking-widest uppercase px-2.5 py-1 border transition-colors disabled:opacity-50 ${
        published
          ? "border-green-600 text-green-700 hover:bg-green-50"
          : "border-ink/20 text-ink-muted hover:border-ink/40"
      }`}
    >
      {published ? "Published" : "Draft"}
    </button>
  );
}
