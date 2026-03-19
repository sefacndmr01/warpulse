-- ── Votes table ─────────────────────────────────────────────────────────────
-- Stores one vote per (event, IP-hash) pair.
-- ip_hash is SHA-256 of the requester's IP so raw IPs are never persisted.
CREATE TABLE votes (
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ip_hash    TEXT NOT NULL,
  direction  TEXT NOT NULL CHECK (direction IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (event_id, ip_hash)
);

CREATE INDEX idx_votes_event_id ON votes(event_id);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Only the service role (Edge Functions) may touch this table
CREATE POLICY "service_all_votes"
  ON votes FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

GRANT ALL ON votes TO service_role;

-- ── vote_event RPC ───────────────────────────────────────────────────────────
-- Single atomic call that handles: new vote, duplicate (same direction),
-- and vote switch (different direction).  Counter updates are done with
-- upvotes = upvotes + 1 to avoid read-modify-write race conditions.
CREATE OR REPLACE FUNCTION vote_event(
  p_event_id  UUID,
  p_ip_hash   TEXT,
  p_direction TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER          -- runs as owner, bypasses RLS on votes & events
SET search_path = public  -- prevent search_path injection
AS $$
DECLARE
  v_existing_dir TEXT;
BEGIN
  -- Validate inputs
  IF p_direction NOT IN ('up', 'down') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_direction');
  END IF;

  -- Event must exist and be approved
  IF NOT EXISTS (
    SELECT 1 FROM events WHERE id = p_event_id AND status = 'approved'
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'event_not_found');
  END IF;

  -- Check for an existing vote from this IP
  SELECT direction INTO v_existing_dir
  FROM votes
  WHERE event_id = p_event_id AND ip_hash = p_ip_hash;

  IF FOUND THEN
    -- Same direction → reject
    IF v_existing_dir = p_direction THEN
      RETURN jsonb_build_object('ok', false, 'error', 'already_voted');
    END IF;

    -- Different direction → switch vote, adjust both counters atomically
    UPDATE votes
       SET direction = p_direction
     WHERE event_id = p_event_id AND ip_hash = p_ip_hash;

    UPDATE events
       SET upvotes   = CASE WHEN p_direction = 'up'
                            THEN upvotes + 1
                            ELSE GREATEST(0, upvotes   - 1) END,
           downvotes = CASE WHEN p_direction = 'down'
                            THEN downvotes + 1
                            ELSE GREATEST(0, downvotes - 1) END
     WHERE id = p_event_id;

    RETURN jsonb_build_object(
      'ok', true, 'switched', true,
      'prev', v_existing_dir, 'direction', p_direction
    );
  END IF;

  -- New vote: insert row and increment the relevant counter atomically
  INSERT INTO votes (event_id, ip_hash, direction)
  VALUES (p_event_id, p_ip_hash, p_direction);

  UPDATE events
     SET upvotes   = CASE WHEN p_direction = 'up'   THEN upvotes   + 1 ELSE upvotes   END,
         downvotes = CASE WHEN p_direction = 'down'  THEN downvotes + 1 ELSE downvotes END
   WHERE id = p_event_id;

  RETURN jsonb_build_object(
    'ok', true, 'switched', false, 'direction', p_direction
  );
END;
$$;

GRANT EXECUTE ON FUNCTION vote_event(UUID, TEXT, TEXT) TO service_role;
