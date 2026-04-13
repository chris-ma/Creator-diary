import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function SignOutButton() {
  async function signOut() {
    "use server";
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Double-check auth (middleware handles the main guard, this is a safety net)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xs tracking-widest uppercase text-ink-muted hover:text-ink transition-colors"
            >
              ← Site
            </Link>
            <nav className="flex gap-6">
              <Link
                href="/admin/entries"
                className="text-xs tracking-widest uppercase text-ink hover:text-ink-light transition-colors"
              >
                Entries
              </Link>
              <Link
                href="/admin/collections"
                className="text-xs tracking-widest uppercase text-ink hover:text-ink-light transition-colors"
              >
                Collections
              </Link>
            </nav>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
