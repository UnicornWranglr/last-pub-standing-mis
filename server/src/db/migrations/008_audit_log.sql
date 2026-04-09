CREATE TABLE IF NOT EXISTS audit_log (
  id             BIGSERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  username       VARCHAR(50),   -- denormalised so the log survives user deletion
  action         VARCHAR(50) NOT NULL,   -- 'login', 'create', 'update', 'delete'
  resource_type  VARCHAR(50),            -- 'takings', 'events', 'expenses', 'payroll', 'user', 'auth'
  resource_id    INTEGER,
  details        JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
