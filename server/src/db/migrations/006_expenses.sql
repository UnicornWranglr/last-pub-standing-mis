CREATE TABLE IF NOT EXISTS expenses (
  id            SERIAL PRIMARY KEY,
  expense_date  DATE          NOT NULL,
  category      VARCHAR(30)   NOT NULL
                CHECK (category IN (
                  'bar_stock', 'food_stock', 'utilities',
                  'fixed', 'maintenance', 'other'
                )),
  amount        NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  supplier      VARCHAR(255),
  description   VARCHAR(500),
  notes         TEXT,
  created_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
