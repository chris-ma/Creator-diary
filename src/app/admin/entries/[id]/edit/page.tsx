import { notFound } from "next/navigation";
import { getEntryById } from "@/lib/queries/entries";
import { getAllCollections } from "@/lib/queries/collections";
import { EntryForm } from "@/components/admin/EntryForm";

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [entry, collections] = await Promise.all([
    getEntryById(id),
    getAllCollections(),
  ]);

  if (!entry) notFound();

  return (
    <div>
      <h1 className="text-lg font-light tracking-wide mb-8">Edit Entry</h1>
      <EntryForm collections={collections} entry={entry} />
    </div>
  );
}
