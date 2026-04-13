export type Collection = {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  location_summary: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type Entry = {
  id: string;
  collection_id: string;
  slug: string;
  photo_path: string;
  date: string | null;
  location_name: string | null;
  country: string | null;
  camera_body: string | null;
  lens: string | null;
  aperture: string | null;
  shutter_speed: string | null;
  iso: number | null;
  focal_length: string | null;
  description: string | null;
  tags: string[];
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type EntryWithCollection = Entry & {
  collection: Pick<Collection, "id" | "title" | "slug">;
};

export type ExifData = {
  camera_body?: string;
  lens?: string;
  aperture?: string;
  shutter_speed?: string;
  iso?: number;
  focal_length?: string;
  date?: string;
};
