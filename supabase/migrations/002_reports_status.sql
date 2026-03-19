ALTER TABLE reports
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'resolved', 'dismissed'));

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

