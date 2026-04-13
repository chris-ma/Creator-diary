import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-ink/10">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs tracking-widest uppercase text-ink hover:text-ink-light transition-colors"
        >
          Travel Photo Diary
        </Link>
        <nav className="flex gap-6">
          <Link
            href="/collections"
            className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors"
          >
            Collections
          </Link>
          <Link
            href="/browse"
            className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors"
          >
            Archive
          </Link>
        </nav>
      </div>
    </header>
  );
}
