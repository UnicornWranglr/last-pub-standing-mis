CREATE TABLE IF NOT EXISTS takings (
  id            SERIAL PRIMARY KEY,
  takings_date  DATE          NOT NULL UNIQUE,
  cash_takings  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (cash_takings >= 0),
  card_takings  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (card_takings >= 0),
  total         NUMERIC(10,2) GENERATED ALWAYS AS (cash_takings + card_takings) STORED,
  notes         TEXT,
  created_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_takings_date ON takings(takings_date DESC);
