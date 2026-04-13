import Link from "next/link";
import { Nav } from "@/components/public/Nav";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper">
      <Nav />
      <div className="max-w-5xl mx-auto px-6 py-32 text-center">
        <p className="text-xs tracking-widest uppercase text-ink-muted mb-4">
          404
        </p>
        <h1 className="text-2xl font-light text-ink mb-6">Page not found</h1>
        <Link
          href="/"
          className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors"
        >
          ← Home
        </Link>
      </div>
    </div>
  );
}
