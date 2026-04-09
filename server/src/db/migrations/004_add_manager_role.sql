-- Add 'manager' as a valid role between 'owner' and 'staff'.
-- Existing users keep their current role; this just widens the allowed set.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('owner', 'manager', 'staff'));
