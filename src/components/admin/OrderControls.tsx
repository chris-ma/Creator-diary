"use client";

import { useTransition } from "react";
import { reorderEntries } from "@/lib/actions/entries";

type Props = {
  id: string;
  displayOrder: number;
  prevId?: string;
  prevOrder?: number;
  nextId?: string;
  nextOrder?: number;
};

export function OrderControls({
  id,
  displayOrder,
  prevId,
  prevOrder,
  nextId,
  nextOrder,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function move(
    otherId: string,
    otherOrder: number
  ) {
    startTransition(async () => {
      await reorderEntries(id, displayOrder, otherId, otherOrder);
    });
  }

  return (
    <span className="inline-flex gap-1">
      <button
        disabled={!prevId || isPending}
        onClick={() => prevId && move(prevId, prevOrder!)}
        aria-label="Move up"
        className="text-ink-muted hover:text-ink disabled:opacity-30 text-sm transition-colors"
      >
        ↑
      </button>
      <button
        disabled={!nextId || isPending}
        onClick={() => nextId && move(nextId, nextOrder!)}
        aria-label="Move down"
        className="text-ink-muted hover:text-ink disabled:opacity-30 text-sm transition-colors"
      >
        ↓
      </button>
    </span>
  );
}
