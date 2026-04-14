-- Atomic click counter table
CREATE TABLE IF NOT EXISTS clicks (
  slug  TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);
