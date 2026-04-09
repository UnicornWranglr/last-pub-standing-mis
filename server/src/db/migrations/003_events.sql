CREATE TABLE IF NOT EXISTS events (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  theme         VARCHAR(255),
  event_date    DATE         NOT NULL,
  event_time    TIME,
  entry_type    VARCHAR(10)  NOT NULL CHECK (entry_type IN ('paid', 'free')),
  ticket_price  NUMERIC(10,2) CHECK (ticket_price IS NULL OR ticket_price >= 0),
  contact_name  VARCHAR(255),
  contact_info  VARCHAR(255),
  notes         TEXT,
  created_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
