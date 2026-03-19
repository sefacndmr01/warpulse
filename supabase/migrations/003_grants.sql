-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- events: anon can read approved (RLS enforces status=approved), and insert
GRANT SELECT ON events TO anon;
GRANT SELECT ON events TO authenticated;
GRANT INSERT ON events TO anon;
GRANT INSERT ON events TO authenticated;
GRANT UPDATE ON events TO authenticated;

-- discussions: anon can read approved and insert
GRANT SELECT ON discussions TO anon;
GRANT SELECT ON discussions TO authenticated;
GRANT INSERT ON discussions TO anon;
GRANT INSERT ON discussions TO authenticated;

-- reports: anon can insert only
GRANT INSERT ON reports TO anon;
GRANT INSERT ON reports TO authenticated;
GRANT SELECT ON reports TO authenticated;

-- service_role already bypasses RLS and has full access in Supabase by default,
-- but explicit grants ensure PostgREST respects them correctly
GRANT ALL ON events TO service_role;
GRANT ALL ON discussions TO service_role;
GRANT ALL ON reports TO service_role;

-- Fix RLS policies that should be service_role only
-- (currently USING (TRUE) allows any role with table privileges to UPDATE/SELECT reports)
DROP POLICY IF EXISTS "service_update_events" ON events;
CREATE POLICY "service_update_events"
  ON events FOR UPDATE
  TO service_role
  USING (TRUE);

DROP POLICY IF EXISTS "service_update_discussions" ON discussions;
CREATE POLICY "service_update_discussions"
  ON discussions FOR UPDATE
  TO service_role
  USING (TRUE);

DROP POLICY IF EXISTS "service_read_reports" ON reports;
CREATE POLICY "service_read_reports"
  ON reports FOR SELECT
  TO service_role
  USING (TRUE);
