import type { Entry } from "@/types";

type Props = {
  entry: Entry;
  className?: string;
};

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
}

export function EntryMeta({ entry, className = "" }: Props) {
  const date = formatDate(entry.date);

  const cameraLine = [
    entry.camera_body,
    entry.lens,
    entry.aperture,
  ]
    .filter(Boolean)
    .join(" · ");

  const techLine = [
    entry.iso ? `ISO ${entry.iso}` : null,
    entry.shutter_speed,
    entry.focal_length,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={`space-y-1 ${className}`}>
      {date && (
        <p className="text-sm text-ink">{date}</p>
      )}
      {entry.location_name && (
        <p className="text-sm text-ink">{entry.location_name}</p>
      )}
      {cameraLine && (
        <p className="text-xs text-ink-muted mt-2">{cameraLine}</p>
      )}
      {techLine && (
        <p className="text-xs text-ink-muted">{techLine}</p>
      )}
    </div>
  );
}
