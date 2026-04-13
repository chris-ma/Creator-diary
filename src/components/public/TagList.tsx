import { Badge } from "@/components/ui/Badge";

type Props = {
  tags: string[];
  className?: string;
};

export function TagList({ tags, className = "" }: Props) {
  if (!tags.length) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <Badge key={tag}>{tag}</Badge>
      ))}
    </div>
  );
}
