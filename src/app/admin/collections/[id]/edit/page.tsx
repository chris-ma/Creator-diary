import { notFound } from "next/navigation";
import { getCollectionById } from "@/lib/queries/collections";
import { CollectionForm } from "@/components/admin/CollectionForm";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollectionById(id);
  if (!collection) notFound();

  return (
    <div>
      <h1 className="text-lg font-light tracking-wide mb-8">
        Edit Collection
      </h1>
      <CollectionForm collection={collection} />
    </div>
  );
}
