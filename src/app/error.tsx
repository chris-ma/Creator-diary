"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-xs tracking-widest uppercase text-ink-muted mb-4">
          Error
        </p>
        <h1 className="text-xl font-light text-ink mb-4">
          Something went wrong
        </h1>
        <p className="text-sm text-ink-muted mb-8">{error.message}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="text-xs tracking-widest uppercase border border-ink/30 px-4 py-2 hover:border-ink/60 text-ink transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors self-center"
          >
            ← Home
          </Link>
        </div>
      </div>
    </div>
  );
}
