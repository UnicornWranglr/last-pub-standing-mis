# Last Pub Standing — MIS

A web-based Management Information System for **Last Pub Standing (LPS)**, replacing a collection of Google Sheets with a single self-owned platform. Phase 1 covers **Daily Takings** and **Events Log** behind a secure login.

- **Frontend:** React + TypeScript + Vite + Tailwind + shadcn/ui-style components → deployed on **Vercel**
- **Backend:** Node.js + Express (ESM) → deployed on **Render**
- **Database:** PostgreSQL 16 → **Render Postgres**
- **Auth:** JWT + bcrypt, two roles (`owner`, `staff`)

## Project layout
```
.
├── render.yaml         # Render Blueprint — Postgres DB + API web service
├── docker-compose.yml  # Local dev alternative (Postgres + API + nginx client)
├── .env.example        # Root env for docker-compose
├── server/             # Express API + migrations + seed
│   └── ...
└── client/             # React SPA
    ├── .env.example    # Client env for VITE_API_URL
    └── ...
```

---

## Access model (owner vs staff)

| Action | Staff | Owner |
|---|:---:|:---:|
| View dashboard, takings, events | ✅ | ✅ |
| Create takings / events | ✅ | ✅ |
| Edit takings / events | ✅ | ✅ |
| **Delete** takings / events | ❌ | ✅ |
| User management (Phase 2) | ❌ | ✅ |

Staff can enter and correct day-to-day records but can't permanently remove financial history — that stays with the owner. Enforced both server-side (`requireRole('owner')` middleware returns 403) and in the UI (delete buttons hidden for staff).

Seeded users (created on first deploy, idempotent):
- **Simon** — owner
- **Daniel** — staff

Passwords are set via `SEED_OWNER_PASSWORD` / `SEED_STAFF_PASSWORD` in Render env vars. Both users should change their passwords after their first login (user-management UI comes in Phase 2; for now, reset by connecting to Postgres directly — see "Managing users" below).

---

## Deploying to Render + Vercel

### 1 · Push to GitHub
Already done if you're reading this.

### 2 · Deploy the API + database on Render

1. In Render, click **New +** → **Blueprint** and select this repo.
2. Render detects `render.yaml` and proposes:
   - **`lps-mis-db`** — Postgres 16 (free tier)
   - **`lps-mis-api`** — Node web service (free tier)
3. Fill in the env vars marked "sync: false":
   - `SEED_OWNER_PASSWORD` — Simon's initial password
   - `SEED_STAFF_PASSWORD` — Daniel's initial password
   - `CLIENT_URL` — leave blank for now (you'll set this after Vercel is up)
4. Click **Apply**. Render will provision Postgres, then build and start the API. The startup command runs migrations + seeds in order, then boots Express.
5. Once the service is live, copy its URL (e.g. `https://lps-mis-api.onrender.com`). You'll need it for Vercel.
6. Sanity-check the API: `curl https://<your-api>.onrender.com/api/health` should return `{"status":"ok"}`.

> **Free tier note:** Render spins down free web services after 15 min of inactivity and cold-starts take ~30s. Fine for demoing; upgrade to a starter plan if the demo needs to be instant.

### 3 · Deploy the client on Vercel

1. In Vercel, **Add New Project** → import this repo.
2. Set **Root Directory** to `client`.
3. Framework preset should auto-detect as **Vite**. Leave build command (`npm run build`) and output directory (`dist`) as defaults.
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = the Render API URL from step 2.5 (e.g. `https://lps-mis-api.onrender.com`) — do **not** include `/api`.
5. Click **Deploy**. Vercel will build and serve the SPA.

### 4 · Point the API at Vercel (CORS)

Once Vercel gives you a URL (e.g. `https://lps-mis.vercel.app`):

1. Back in Render, open `lps-mis-api` → **Environment**.
2. Set `CLIENT_URL` to the Vercel URL.
3. Trigger a manual redeploy (or just save — Render redeploys automatically on env change).

The API will now only accept CORS requests from that origin. Done.

### 5 · First login

Visit the Vercel URL, log in as:
- **simon** with `SEED_OWNER_PASSWORD`, or
- **daniel** with `SEED_STAFF_PASSWORD`

Change the passwords from the database as soon as you can (see "Managing users").

---

## Running locally (Docker)

```bash
cp .env.example .env
# Fill in DB_PASSWORD, JWT_SECRET, SEED_OWNER_PASSWORD, SEED_STAFF_PASSWORD
docker compose up --build
```

Open http://localhost:8080 and sign in as `simon` or `daniel`. Data persists in the `pgdata` volume; `docker compose down -v` wipes it.

## Running locally (no Docker)

Needs Node 20+ and a running Postgres 16.

**Server:**
```bash
cd server
npm install
# Set env vars in server/.env or inline:
#   DATABASE_URL=postgresql://user:pass@localhost:5432/pub_mis
#   JWT_SECRET=anything-long
#   SEED_OWNER_PASSWORD=...
#   SEED_STAFF_PASSWORD=...
npm run migrate
npm run seed
npm run dev       # :4000
```

**Client:**
```bash
cd client
npm install
npm run dev       # :5173 — vite proxies /api to :4000
```

Open http://localhost:5173.

---

## API overview

All routes are under `/api`. Everything except `POST /api/auth/login` requires `Authorization: Bearer <token>`.

| Method | Path | Role | Description |
|---|---|---|---|
| POST   | `/api/auth/login`         | any     | Exchange credentials for a JWT |
| GET    | `/api/auth/me`            | any     | Current user from token |
| GET    | `/api/takings`            | any     | List; `?from=&to=` filters |
| GET    | `/api/takings/summary`    | any     | `{ weekTotal, monthTotal }` |
| GET    | `/api/takings/:id`        | any     | Single entry |
| POST   | `/api/takings`            | any     | Create (unique per date) |
| PUT    | `/api/takings/:id`        | any     | Update |
| DELETE | `/api/takings/:id`        | **owner** | Delete |
| GET    | `/api/events`             | any     | List; `?month=YYYY-MM` |
| GET    | `/api/events/upcoming-count` | any | Count for current month |
| GET    | `/api/events/:id`         | any     | Single event |
| POST   | `/api/events`             | any     | Create |
| PUT    | `/api/events/:id`         | any     | Update |
| DELETE | `/api/events/:id`         | **owner** | Delete |

---

## Managing users

Phase 1 has no user-management UI. To add a new staff user or reset a password, connect to the Render database (via Render dashboard → `lps-mis-db` → **Connect**) and use `psql`:

```sql
-- Add a new staff user
-- First generate a hash inside the API container's shell:
--   node -e "console.log(require('bcryptjs').hashSync('their-password', 10))"
INSERT INTO users (username, password_hash, role)
VALUES ('alice', '<paste the hash>', 'staff');

-- Reset someone's password
UPDATE users SET password_hash = '<new hash>' WHERE username = 'simon';

-- Delete a user
DELETE FROM users WHERE username = 'alice';
```

---

## Phase 2+ (not yet built)

The `routes / controllers / models` split on the server and the `pages/<module>/` split on the client are already module-shaped. Planned additions:

- User management UI + password reset flow
- Company documents / manuals (with file storage)
- IP / network inventory
- NAS integration for file storage
- Richer reporting and analytics
- Per-user edit history / audit log
