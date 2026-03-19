-- Enable Supabase Realtime for the events table.
-- Supabase creates the supabase_realtime publication by default;
-- we just need to add the events table to it.
ALTER PUBLICATION supabase_realtime ADD TABLE events;
