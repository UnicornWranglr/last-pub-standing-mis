CREATE TABLE IF NOT EXISTS payroll (
  id                SERIAL PRIMARY KEY,
  pay_period_start  DATE          NOT NULL,
  pay_period_end    DATE          NOT NULL,
  employee_name     VARCHAR(255)  NOT NULL,
  gross_pay         NUMERIC(10,2) NOT NULL CHECK (gross_pay >= 0),
  ni_contribution   NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (ni_contribution >= 0),
  pension           NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (pension >= 0),
  net_pay           NUMERIC(10,2) GENERATED ALWAYS AS (gross_pay - ni_contribution - pension) STORED,
  notes             TEXT,
  created_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (pay_period_end >= pay_period_start)
);

CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll(pay_period_end DESC);
