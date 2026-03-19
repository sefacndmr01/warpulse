-- ── Realtime publications ────────────────────────────────────────────────────
-- discussions and reports weren't in the publication yet
ALTER PUBLICATION supabase_realtime ADD TABLE discussions;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;

-- ── RLS: allow anon to read all statuses ─────────────────────────────────────
-- Required so Supabase Realtime can deliver INSERT/UPDATE events for pending
-- rows to the anon key.  The public-facing Edge Functions still filter by
-- status=approved, so the UX is unaffected.

-- Drop the approved-only policy and replace with unrestricted SELECT
DROP POLICY IF EXISTS "public_read_approved_events" ON events;
CREATE POLICY "anon_read_events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "public_read_approved_discussions" ON discussions;
CREATE POLICY "anon_read_discussions"
  ON discussions FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Reports: allow anon SELECT (reason texts are not sensitive)
DROP POLICY IF EXISTS "service_read_reports" ON reports;
CREATE POLICY "anon_read_reports"
  ON reports FOR SELECT
  TO anon, authenticated, service_role
  USING (TRUE);
