import { getAllCollections } from "@/lib/queries/collections";
import { EntryForm } from "@/components/admin/EntryForm";

export default async function NewEntryPage() {
  const collections = await getAllCollections();

  return (
    <div>
      <h1 className="text-lg font-light tracking-wide mb-8">New Entry</h1>
      <EntryForm collections={collections} />
    </div>
  );
}
