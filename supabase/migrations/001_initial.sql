-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Event type enum
CREATE TYPE event_type_enum AS ENUM (
  'attack',
  'missile',
  'airstrike',
  'explosion',
  'political',
  'protest',
  'ceasefire',
  'humanitarian',
  'displacement',
  'other'
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  event_type event_type_enum NOT NULL DEFAULT 'other',
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  location_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ai_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ai_confidence DECIMAL(4,3),
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Discussions
CREATE TABLE discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) >= 3 AND length(content) <= 2000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_discussions_event_id ON discussions(event_id);
CREATE INDEX idx_reports_event_id ON reports(event_id);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Public can read approved events
CREATE POLICY "public_read_approved_events"
  ON events FOR SELECT
  USING (status = 'approved');

-- Anyone can insert events (anonymous submissions)
CREATE POLICY "public_insert_events"
  ON events FOR INSERT
  WITH CHECK (TRUE);

-- Service role can update (for AI verification)
CREATE POLICY "service_update_events"
  ON events FOR UPDATE
  USING (TRUE);

-- Public can read approved discussions
CREATE POLICY "public_read_approved_discussions"
  ON discussions FOR SELECT
  USING (status = 'approved');

-- Anyone can insert discussions
CREATE POLICY "public_insert_discussions"
  ON discussions FOR INSERT
  WITH CHECK (TRUE);

-- Service role updates discussions
CREATE POLICY "service_update_discussions"
  ON discussions FOR UPDATE
  USING (TRUE);

-- Anyone can insert reports
CREATE POLICY "public_insert_reports"
  ON reports FOR INSERT
  WITH CHECK (TRUE);

-- Service role reads reports
CREATE POLICY "service_read_reports"
  ON reports FOR SELECT
  USING (TRUE);
