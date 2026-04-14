import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "travel-diary";

type SeedEntry = {
  slug: string;
  picsumId: number;
  date: string;
  location_name: string;
  country: string;
  camera_body: string;
  lens: string;
  aperture: string;
  shutter_speed: string;
  iso: number;
  focal_length: string;
  description: string;
  tags: string[];
  display_order: number;
};

const JAPAN_ENTRIES: SeedEntry[] = [
  {
    slug: "fushimi-inari-taisha-2025-01-14",
    picsumId: 167,
    date: "2025-01-14",
    location_name: "Fushimi Inari Taisha",
    country: "Japan",
    camera_body: "Sony A7 IV",
    lens: "Sony FE 24-70mm f/2.8 GM II",
    aperture: "f/4.0",
    shutter_speed: "1/200s",
    iso: 400,
    focal_length: "35mm",
    description:
      "The torii tunnel stretches endlessly uphill, each gate donated by a business as an offering to Inari, the god of foxes and rice. Early morning light filters through the vermillion pillars before the crowds arrive.",
    tags: ["shrine", "torii", "kyoto", "golden-hour"],
    display_order: 1,
  },
  {
    slug: "arashiyama-bamboo-grove-2025-01-16",
    picsumId: 1018,
    date: "2025-01-16",
    location_name: "Arashiyama Bamboo Grove",
    country: "Japan",
    camera_body: "Sony A7 IV",
    lens: "Sony FE 35mm f/1.4 GM",
    aperture: "f/2.0",
    shutter_speed: "1/500s",
    iso: 200,
    focal_length: "35mm",
    description:
      "Standing inside the bamboo grove feels like being swallowed by a green cathedral. The stalks creak softly in the wind. A cold January morning meant we had the path nearly to ourselves.",
    tags: ["bamboo", "forest", "kyoto", "nature"],
    display_order: 2,
  },
  {
    slug: "kinkaku-ji-golden-pavilion-2025-01-17",
    picsumId: 552,
    date: "2025-01-17",
    location_name: "Kinkaku-ji",
    country: "Japan",
    camera_body: "Sony A7 IV",
    lens: "Sony FE 24-70mm f/2.8 GM II",
    aperture: "f/5.6",
    shutter_speed: "1/250s",
    iso: 100,
    focal_length: "50mm",
    description:
      "The Temple of the Golden Pavilion lives up to every photograph you have ever seen of it — and then exceeds it. Reflected perfectly in Kyoko-chi Pond on a windless winter morning, the gold leaf facade glows warm against a crisp blue sky.",
    tags: ["temple", "kyoto", "reflection", "architecture"],
    display_order: 3,
  },
  {
    slug: "shibuya-crossing-at-dusk-2025-01-20",
    picsumId: 325,
    date: "2025-01-20",
    location_name: "Shibuya Crossing",
    country: "Japan",
    camera_body: "Sony A7 IV",
    lens: "Sony FE 24-70mm f/2.8 GM II",
    aperture: "f/8.0",
    shutter_speed: "1/15s",
    iso: 800,
    focal_length: "24mm",
    description:
      "Five streams of people converge at once — umbrellas open against a light drizzle, neon reflections smearing across the wet pavement. I braced against a lamppost and let the motion blur tell the story.",
    tags: ["street", "tokyo", "night", "motion-blur"],
    display_order: 4,
  },
];

const PORTUGAL_ENTRIES: SeedEntry[] = [
  {
    slug: "alfama-viewpoint-2026-03-08",
    picsumId: 336,
    date: "2026-03-08",
    location_name: "Portas do Sol Viewpoint, Alfama",
    country: "Portugal",
    camera_body: "Fujifilm X-T5",
    lens: "Fujinon XF 23mm f/1.4 R LM WR",
    aperture: "f/2.8",
    shutter_speed: "1/1000s",
    iso: 160,
    focal_length: "23mm",
    description:
      "Alfama cascades down toward the Tagus in a jumble of terracotta rooftops and white-washed walls. A laundry line strings colour between two buildings. From the miradouro the whole neighbourhood breathes slowly in the morning sun.",
    tags: ["lisbon", "cityscape", "morning", "architecture"],
    display_order: 1,
  },
  {
    slug: "sintra-pena-palace-2026-03-10",
    picsumId: 403,
    date: "2026-03-10",
    location_name: "Palácio Nacional da Pena, Sintra",
    country: "Portugal",
    camera_body: "Fujifilm X-T5",
    lens: "Fujinon XF 16-80mm f/4 R OIS WR",
    aperture: "f/5.6",
    shutter_speed: "1/320s",
    iso: 320,
    focal_length: "16mm",
    description:
      "Pena Palace appears through the mist like something from a fairy tale — battlements painted in mustard and terracotta perched above an ocean of cloud that had swallowed the valley below. We climbed the cobblestone path in almost complete silence.",
    tags: ["sintra", "palace", "mist", "architecture"],
    display_order: 2,
  },
  {
    slug: "porto-ribeira-sunset-2026-03-13",
    picsumId: 374,
    date: "2026-03-13",
    location_name: "Ribeira, Porto",
    country: "Portugal",
    camera_body: "Fujifilm X-T5",
    lens: "Fujinon XF 23mm f/1.4 R LM WR",
    aperture: "f/4.0",
    shutter_speed: "1/640s",
    iso: 160,
    focal_length: "23mm",
    description:
      "The rabelo boats sit still on the Douro as the last light turns the river gold. Across the water the port wine lodges of Vila Nova de Gaia climb the hillside in the warm evening haze. A glass of tawny port in hand seemed entirely mandatory.",
    tags: ["porto", "river", "sunset", "boats"],
    display_order: 3,
  },
];

async function fetchAndUploadImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  picsumId: number,
  storagePath: string
): Promise<void> {
  const url = `https://picsum.photos/id/${picsumId}/1600/1200`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`picsum fetch failed for id ${picsumId}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });
  if (error) throw new Error(`Storage upload failed for ${storagePath}: ${error.message}`);
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const log: string[] = [];

  try {
    // ── Japan Winter 2025 ─────────────────────────────────────────────────────
    const { data: existingJapan } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", "japan-winter-2025")
      .single();

    let japanId: string;

    if (existingJapan) {
      japanId = existingJapan.id;
      log.push("Collection 'japan-winter-2025' already exists, skipping insert");
    } else {
      // Upload cover image
      await fetchAndUploadImage(
        supabase,
        167,
        "collections/japan-winter-2025/cover.jpg"
      );
      log.push("Uploaded Japan cover image");

      const { data: japanCol, error: japanErr } = await supabase
        .from("collections")
        .insert({
          title: "Japan Winter 2025",
          slug: "japan-winter-2025",
          cover_image: "collections/japan-winter-2025/cover.jpg",
          description:
            "Two weeks in Japan during January — trading summer crowds for frost-tipped temples, near-empty bamboo groves, and the particular quiet of a Kyoto morning under a low grey sky.",
          start_date: "2025-01-12",
          end_date: "2025-01-26",
          location_summary: "Kyoto · Tokyo · Nara",
          is_published: true,
          display_order: 1,
        })
        .select("id")
        .single();

      if (japanErr || !japanCol) throw new Error(`Failed to create Japan collection: ${japanErr?.message}`);
      japanId = japanCol.id;
      log.push("Created collection: Japan Winter 2025");
    }

    // Japan entries
    for (const entry of JAPAN_ENTRIES) {
      const { data: existing } = await supabase
        .from("entries")
        .select("id")
        .eq("collection_id", japanId)
        .eq("slug", entry.slug)
        .single();

      if (existing) {
        log.push(`Entry '${entry.slug}' already exists, skipping`);
        continue;
      }

      const storagePath = `entries/${japanId}/${entry.slug}.jpg`;
      await fetchAndUploadImage(supabase, entry.picsumId, storagePath);

      const { error: entryErr } = await supabase.from("entries").insert({
        collection_id: japanId,
        slug: entry.slug,
        photo_path: storagePath,
        date: entry.date,
        location_name: entry.location_name,
        country: entry.country,
        camera_body: entry.camera_body,
        lens: entry.lens,
        aperture: entry.aperture,
        shutter_speed: entry.shutter_speed,
        iso: entry.iso,
        focal_length: entry.focal_length,
        description: entry.description,
        tags: entry.tags,
        display_order: entry.display_order,
        is_published: true,
      });

      if (entryErr) throw new Error(`Failed to create entry '${entry.slug}': ${entryErr.message}`);
      log.push(`Created entry: ${entry.location_name}`);
    }

    // ── Portugal Spring 2026 ──────────────────────────────────────────────────
    const { data: existingPortugal } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", "portugal-spring-2026")
      .single();

    let portugalId: string;

    if (existingPortugal) {
      portugalId = existingPortugal.id;
      log.push("Collection 'portugal-spring-2026' already exists, skipping insert");
    } else {
      await fetchAndUploadImage(
        supabase,
        336,
        "collections/portugal-spring-2026/cover.jpg"
      );
      log.push("Uploaded Portugal cover image");

      const { data: ptCol, error: ptErr } = await supabase
        .from("collections")
        .insert({
          title: "Portugal Spring 2026",
          slug: "portugal-spring-2026",
          cover_image: "collections/portugal-spring-2026/cover.jpg",
          description:
            "A ten-day loop through Lisbon, Sintra, and Porto in early spring — before the tourist season peaks and the mimosa is still in bloom. Slow mornings, strong coffee, and light that turns everything amber.",
          start_date: "2026-03-06",
          end_date: "2026-03-16",
          location_summary: "Lisbon · Sintra · Porto",
          is_published: true,
          display_order: 2,
        })
        .select("id")
        .single();

      if (ptErr || !ptCol) throw new Error(`Failed to create Portugal collection: ${ptErr?.message}`);
      portugalId = ptCol.id;
      log.push("Created collection: Portugal Spring 2026");
    }

    // Portugal entries
    for (const entry of PORTUGAL_ENTRIES) {
      const { data: existing } = await supabase
        .from("entries")
        .select("id")
        .eq("collection_id", portugalId)
        .eq("slug", entry.slug)
        .single();

      if (existing) {
        log.push(`Entry '${entry.slug}' already exists, skipping`);
        continue;
      }

      const storagePath = `entries/${portugalId}/${entry.slug}.jpg`;
      await fetchAndUploadImage(supabase, entry.picsumId, storagePath);

      const { error: entryErr } = await supabase.from("entries").insert({
        collection_id: portugalId,
        slug: entry.slug,
        photo_path: storagePath,
        date: entry.date,
        location_name: entry.location_name,
        country: entry.country,
        camera_body: entry.camera_body,
        lens: entry.lens,
        aperture: entry.aperture,
        shutter_speed: entry.shutter_speed,
        iso: entry.iso,
        focal_length: entry.focal_length,
        description: entry.description,
        tags: entry.tags,
        display_order: entry.display_order,
        is_published: true,
      });

      if (entryErr) throw new Error(`Failed to create entry '${entry.slug}': ${entryErr.message}`);
      log.push(`Created entry: ${entry.location_name}`);
    }

    return NextResponse.json({ ok: true, log });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message, log }, { status: 500 });
  }
}
