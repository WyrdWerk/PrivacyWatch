-- Phase 4 semantic index. Applied only after the D1 database exists and the
-- d1_databases binding is added to both wrangler configs (same database_id).
CREATE TABLE IF NOT EXISTS chunks (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  url TEXT NOT NULL,
  text TEXT NOT NULL,
  embedding BLOB NOT NULL,
  revision TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chunks_url ON chunks (url);
CREATE INDEX IF NOT EXISTS idx_chunks_provider ON chunks (provider_id);
