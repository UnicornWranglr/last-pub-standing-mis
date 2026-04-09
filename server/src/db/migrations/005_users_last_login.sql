-- Track the last successful login for each user so the admin page
-- can display "last seen" timestamps.

ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
