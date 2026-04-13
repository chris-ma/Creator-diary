-- ============================================================
-- Travel Photo Diary — Initial Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Utility: auto-update updated_at on row change
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Table: collections
-- ============================================================
CREATE TABLE collections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  -- Storage path only (e.g. "collections/japan-winter-2025/cover.jpg")
  -- Full URL assembled in application code via lib/storage.ts
  cover_image      TEXT,
  description      TEXT,
  start_date       DATE,
  end_date         DATE,
  location_summary TEXT,
  is_published     BOOLEAN NOT NULL DEFAULT false,
  display_order    INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Table: entries
-- ============================================================
CREATE TABLE entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  -- Slug scoped within a collection (e.g. "kyoto-fushimi-inari-2024-11-03")
  slug          TEXT NOT NULL,
  -- Storage path only (e.g. "entries/abc-123/original.jpg")
  photo_path    TEXT NOT NULL,
  -- date is nullable — user may only know an approximate month
  date          DATE,
  location_name TEXT,
  country       TEXT,
  -- Camera / EXIF metadata
  camera_body   TEXT,
  lens          TEXT,
  aperture      TEXT,
  shutter_speed TEXT,
  iso           INTEGER,
  focal_length  TEXT,
  -- Content
  description   TEXT,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  -- Ordering and state
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published  BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Slug must be unique within a collection
  UNIQUE (collection_id, slug)
);

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_entries_collection_id    ON entries(collection_id);
CREATE INDEX idx_entries_date             ON entries(date);
CREATE INDEX idx_entries_tags             ON entries USING GIN(tags);
CREATE INDEX idx_collections_slug         ON collections(slug);
CREATE INDEX idx_entries_display_order    ON entries(collection_id, display_order);
CREATE INDEX idx_collections_display_order ON collections(display_order);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries     ENABLE ROW LEVEL SECURITY;

-- Public visitors: read published collections only
CREATE POLICY "Public read published collections"
  ON collections FOR SELECT
  USING (is_published = true);

-- Authenticated admin: full access to collections
CREATE POLICY "Admin full access collections"
  ON collections FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Public visitors: read published entries only
CREATE POLICY "Public read published entries"
  ON entries FOR SELECT
  USING (is_published = true);

-- Authenticated admin: full access to entries
CREATE POLICY "Admin full access entries"
  ON entries FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
