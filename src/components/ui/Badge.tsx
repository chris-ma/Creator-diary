export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs tracking-wider text-ink-muted border border-ink/10 px-2 py-0.5">
      {children}
    </span>
  );
}
