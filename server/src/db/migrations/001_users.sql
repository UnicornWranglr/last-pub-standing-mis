CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50)  UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'staff'
                CHECK (role IN ('owner', 'staff')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
