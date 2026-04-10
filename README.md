# Last Pub Standing — MIS

A web-based Management Information System for **Last Pub Standing (LPS) — City Pub & Kitchen**, replacing a collection of Google Sheets with a single self-owned platform.

- **Frontend:** React + TypeScript + Vite + Tailwind + shadcn/ui-style components → deployed on **Vercel**
- **Backend:** Node.js + Express (ESM) → deployed on **Render**
- **Database:** PostgreSQL 16 → **Render Postgres**
- **Auth:** JWT + bcrypt, three roles (`owner`, `manager`, `staff`)
- **Styling:** Antique-gold LPS brand pass with Google Fonts "Rye" display face

---

## What's in the box

### Phase 1 — shipped
- Secure login with JWT
- Daily takings: cash, card, total, notes, per-day unique
- Events log: name, theme, date/time, free/paid, ticket price, contacts
- Responsive layout (desktop top nav, mobile bottom tab bar)
- Dashboard with week/month summary tiles

### Phase 2 — shipped
- **Three-tier roles** — `owner` / `manager` / `staff` with a clean permission matrix
- **Expenses module** — Bar Stock, Food Stock, Utilities, Fixed, Maintenance, Other (manager + owner)
- **Payroll module** — per-employee pay periods with gross / NI / pension / auto-computed net (owner only)
- **Admin page** — owner-only hub with:
  - Read-only access matrix
  - Business totals (revenue, expenses, payroll, **profit**) across week/month/quarter/year/all-time
  - User management: list, add, change role, reset password, delete
  - Audit log viewer (last 100 actions across all modules + logins)
  - CSV data export for every module
  - Backup guidance + support/about
- **Audit logging** — every write path (create/update/delete) + every login writes to `audit_log` with user, action, resource, JSONB details
- **Roadmap page** — static view of what's shipped and what's next
- **Deployment page** — cloud-vs-self-hosted comparison for the owner
- **LPS branding pass** — antique gold primary, Rye display font for the logo lockup, dark chrome on header + login

### Phase 3 — not yet built (documented on `/roadmap`)
- Compliance checklists (cellar clean, line clean, fridge temps)
- Certificate expiry tracker (license, PAT, gas safety, food hygiene, PRS/PPL)
- Incident log
- Food hygiene / HACCP (priority once the kitchen reopens)
- Stock / cellar log, supplier address book, staff rota, cash-up reconciliation, private bookings

---

## Project layout

```
.
├── render.yaml            # Render Blueprint — web service only (DB is manual, see below)
├── docker-compose.yml     # Local dev (Postgres + API + nginx client)
├── .env.example           # Root env for docker-compose
├── server/                # Express API
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/        # env, pg pool (with SSL auto-detection + DATE type parser)
│       ├── lib/           # audit logger, CSV writer
│       ├── middleware/    # requireAuth, requireRole, validate (zod), errorHandler
│       ├── routes/        # auth, takings, events, expenses, payroll, admin
│       ├── controllers/   # one per route group
│       ├── models/        # thin SQL wrappers — takings, events, expenses, payroll, user, audit
│       └── db/
│           ├── migrate.js
│           ├── seed.js
│           └── migrations/  # 001..008
└── client/                # React SPA
    ├── .env.example       # VITE_API_URL for prod builds
    ├── vercel.json        # SPA rewrites
    ├── package.json
    └── src/
        ├── App.tsx        # routes + role gating
        ├── main.tsx
        ├── index.css      # CSS variables (light + chrome-dark helper)
        ├── contexts/
        │   └── AuthContext.tsx
        ├── components/
        │   ├── Layout.tsx           # dark chrome top nav + mobile tab bar
        │   ├── ProtectedRoute.tsx   # role-gated wrapper
        │   ├── MobileMoreDrawer.tsx # overflow drawer for mobile nav
        │   └── ui/                  # shadcn-style primitives
        ├── pages/
        │   ├── Login.tsx           # dark brand lockup
        │   ├── Dashboard.tsx       # full for owner/manager, lite for staff
        │   ├── Admin.tsx           # composite of panels below
        │   ├── Roadmap.tsx         # static
        │   ├── Deployment.tsx      # static
        │   ├── takings/
        │   ├── events/
        │   ├── expenses/
        │   ├── payroll/
        │   └── admin/              # RoleMatrix, Users, BusinessTotals, AuditLog, DataExport, BackupGuidance, SupportInfo
        ├── types/
        └── lib/
```

---

## Access model

| Feature | Staff | Manager | Owner |
|---|:---:|:---:|:---:|
| Login / logout | ✅ | ✅ | ✅ |
| Dashboard | ✅ lite | ✅ | ✅ |
| Insights (charts, Phase 2b) | ❌ | ✅ | ✅ |
| Takings — view | ✅ | ✅ | ✅ |
| Takings — create / edit | ✅ | ✅ | ✅ |
| Takings — delete | ❌ | ❌ | ✅ |
| Events — view | ✅ read-only | ✅ | ✅ |
| Events — create / edit | ❌ | ✅ | ✅ |
| Events — delete | ❌ | ❌ | ✅ |
| Expenses — view / create / edit | ❌ | ✅ | ✅ |
| Expenses — delete | ❌ | ❌ | ✅ |
| Payroll (anything) | ❌ | ❌ | ✅ |
| Admin page & user management | ❌ | ❌ | ✅ |
| Deployment page | ❌ | ❌ | ✅ |
| Roadmap page | ❌ | ❌ | ✅ |

Enforced on both sides:
- **Server** — `requireRole(...)` middleware on the affected routes returns 403 for disallowed roles
- **Client** — `<ProtectedRoute requireRole={...}>` redirects to `/`, nav items filter out what the role can't see, and write-action buttons (Add / Edit / Delete) hide for restricted roles

**Seeded users** (created on first deploy, idempotent):
- **Simon** — owner — initial password from `SEED_OWNER_PASSWORD`
- **Karen** — manager — initial password from `SEED_MANAGER_PASSWORD`
- **Daniel** — staff — initial password from `SEED_STAFF_PASSWORD`

Any user whose `SEED_*_PASSWORD` is not set is silently skipped on seed — safe to deploy partially. Phase 2's admin page lets the owner reset other users' passwords in-app; until then any out-of-band reset is a `psql` one-liner (see "Managing users").

---

## Deploying to Render + Vercel

### 1 · Push to GitHub
Already done if you're reading this.

### 2 · Create the Postgres database on Render (one-time, manual)

`render.yaml` declares the **web service only**. Render's free tier allows only one Postgres per account, so we create the DB manually and let the blueprint reference it via an env var.

1. Render dashboard → **New +** → **PostgreSQL**
2. Name: `lps-mis-db` (any name works)
3. Pick a plan (free if you have the slot, starter+ otherwise)
4. Region: closest to your users
5. Create, wait for provisioning
6. On the DB info page, copy the **Internal Database URL** (looks like `postgresql://...@dpg-xxxxx-a/lps_mis_db`). Keep it handy.

If the web service and the DB end up in different regions, use the **External Database URL** instead — it's slightly slower but works cross-region. The pg pool auto-detects Render's external domain and enables SSL.

### 3 · Deploy the API via the blueprint

1. Render dashboard → **New +** → **Blueprint** → select this repo
2. Render detects `render.yaml` and proposes the `lps-mis-api` web service
3. Fill in the env vars marked `sync: false`:
   - `DATABASE_URL` — paste the Internal (or External) URL from step 2
   - `SEED_OWNER_PASSWORD` — Simon's initial password
   - `SEED_MANAGER_PASSWORD` — Karen's initial password
   - `SEED_STAFF_PASSWORD` — Daniel's initial password
   - `CLIENT_URL` — leave blank for now (set after Vercel is up)
4. Click **Apply**. The start command runs in order: `migrate` → `seed` → `node src/index.js`
5. Watch the logs. You should see the full migrations pipeline apply `001` through `008`, then `[seed] created ...` lines for each user whose password you set, then `[pub-mis] server listening on :4000`
6. Sanity check: `curl https://<your-api>.onrender.com/api/health` → `{"status":"ok"}`

> **Free tier note:** Render spins down free web services after 15 min of inactivity; first request after sleep takes ~30s. Fine for demos. Upgrade to starter for always-on.
>
> **Runtime note:** Render uses its native Node runtime for the API (not Docker), so `server/Dockerfile` is ignored on Render. The Dockerfile exists only for local `docker compose up`.

### 4 · Deploy the client on Vercel

1. Vercel → **Add New Project** → import this repo
2. **Root Directory:** `client` (important — monorepo layout)
3. Framework preset: **Vite** (auto-detected). Leave build/output defaults.
4. Environment Variables → add one:
   - **`VITE_API_URL`** = the Render API URL (e.g. `https://lps-mis-api.onrender.com`) — no trailing slash, no `/api` suffix
5. Deploy

### 5 · Wire CORS

Once Vercel gives you a URL (e.g. `https://last-pub-standing-mis.vercel.app`):

1. Render → `lps-mis-api` → **Environment**
2. Add / edit `CLIENT_URL` → the Vercel URL, **exact match** (no trailing slash, no path)
3. Save — Render auto-redeploys

The API now only accepts CORS requests from your Vercel origin.

### 6 · First login

Visit the Vercel URL, sign in as `simon`, `karen`, or `daniel` using whichever passwords you set. Change them from the admin page (Users panel → reset password) once you're in as Simon.

---

## Running locally (Docker)

```bash
cp .env.example .env
# Fill in at least: DB_PASSWORD, JWT_SECRET,
#                   SEED_OWNER_PASSWORD, SEED_MANAGER_PASSWORD, SEED_STAFF_PASSWORD
docker compose up --build
```

Open http://localhost:8080 and sign in. Data persists in the `pgdata` volume; `docker compose down -v` wipes it.

## Running locally (no Docker)

Needs Node 20+ and a running Postgres 16.

**Server:**
```bash
cd server
npm install
# Set env vars in server/.env or inline:
#   DATABASE_URL=postgresql://user:pass@localhost:5432/pub_mis
#   JWT_SECRET=anything-long-and-random
#   SEED_OWNER_PASSWORD=...
#   SEED_MANAGER_PASSWORD=...
#   SEED_STAFF_PASSWORD=...
npm run migrate
npm run seed
npm run dev       # :4000
```

**Client:**
```bash
cd client
npm install
npm run dev       # :5173, Vite dev proxy forwards /api to :4000
```

Open http://localhost:5173.

---

## API overview

All routes under `/api`. Everything except `POST /api/auth/login` requires `Authorization: Bearer <token>`.

### Auth
| Method | Path | Role | |
|---|---|---|---|
| POST | `/api/auth/login` | any | Exchange credentials for a JWT |
| GET  | `/api/auth/me`    | any | Current user |

### Takings
| Method | Path | Role | |
|---|---|---|---|
| GET    | `/api/takings`         | any     | `?from=&to=` filters |
| GET    | `/api/takings/summary` | any     | `{ weekTotal, monthTotal }` |
| GET    | `/api/takings/:id`     | any     | |
| POST   | `/api/takings`         | any     | Create (unique per date) |
| PUT    | `/api/takings/:id`     | any     | |
| DELETE | `/api/takings/:id`     | **owner** | |

### Events
| Method | Path | Role | |
|---|---|---|---|
| GET    | `/api/events`                | any               | `?month=YYYY-MM` |
| GET    | `/api/events/upcoming-count` | any               | |
| GET    | `/api/events/:id`            | any               | |
| POST   | `/api/events`                | **manager/owner** | |
| PUT    | `/api/events/:id`            | **manager/owner** | |
| DELETE | `/api/events/:id`            | **owner**         | |

### Expenses
| Method | Path | Role | |
|---|---|---|---|
| GET    | `/api/expenses`         | **manager/owner** | `?from=&to=&category=` |
| GET    | `/api/expenses/summary` | **manager/owner** | Week/month/quarter/year + by-category |
| GET    | `/api/expenses/:id`     | **manager/owner** | |
| POST   | `/api/expenses`         | **manager/owner** | |
| PUT    | `/api/expenses/:id`     | **manager/owner** | |
| DELETE | `/api/expenses/:id`     | **owner**         | |

### Payroll
| Method | Path | Role | |
|---|---|---|---|
| GET    | `/api/payroll`         | **owner** | |
| GET    | `/api/payroll/summary` | **owner** | Week/month/quarter/year net |
| GET    | `/api/payroll/:id`     | **owner** | |
| POST   | `/api/payroll`         | **owner** | |
| PUT    | `/api/payroll/:id`     | **owner** | |
| DELETE | `/api/payroll/:id`     | **owner** | |

### Admin (owner-only, all routes)
| Method | Path | Description |
|---|---|---|
| GET    | `/api/admin/users`                      | List users + last-login timestamps |
| POST   | `/api/admin/users`                      | `{username, password, role}` |
| PUT    | `/api/admin/users/:id`                  | `{role}` — can't change own role |
| POST   | `/api/admin/users/:id/reset-password`   | `{password}` |
| DELETE | `/api/admin/users/:id`                  | Can't delete self |
| GET    | `/api/admin/audit-log`                  | `?limit=100&user_id=&action=` |
| GET    | `/api/admin/business-totals`            | Revenue / expenses / payroll / profit by period |
| GET    | `/api/admin/export/takings.csv`         | CSV download |
| GET    | `/api/admin/export/events.csv`          | CSV download |
| GET    | `/api/admin/export/expenses.csv`        | CSV download |
| GET    | `/api/admin/export/payroll.csv`         | CSV download |

---

## Database schema (current migrations)

| Migration | Purpose |
|---|---|
| `001_users.sql` | Users table with role check (phase 1: `owner`, `staff`) |
| `002_takings.sql` | Daily takings; `total` is a GENERATED column; unique per date |
| `003_events.sql` | Events with paid/free check and optional ticket price |
| `004_add_manager_role.sql` | Widens role check to include `manager` |
| `005_users_last_login.sql` | Adds `last_login_at` for the admin page |
| `006_expenses.sql` | Expenses with category check (bar_stock / food_stock / utilities / fixed / maintenance / other) |
| `007_payroll.sql` | Payroll with GENERATED `net_pay` and period-end ≥ period-start check |
| `008_audit_log.sql` | Audit log with denormalised username (survives user deletion) |

All migrations are idempotent (`IF NOT EXISTS` / `IF EXISTS` guards) and tracked in a `schema_migrations` table by filename.

---

## Managing users

The admin page (owner-only) has full user management: list, add, change role, reset password, delete. That's the primary path.

For out-of-band fixes (locked out, etc.), connect to the Render database and use `psql`:

```sql
-- Reset someone's password (generate a bcrypt hash first)
-- docker compose exec server node -e "console.log(require('bcryptjs').hashSync('new-password', 10))"
-- or from inside Render's shell on the web service container
UPDATE users SET password_hash = '<new hash>' WHERE username = 'simon';

-- Change a role
UPDATE users SET role = 'manager' WHERE username = 'karen';

-- Add a user
INSERT INTO users (username, password_hash, role)
VALUES ('alice', '<hash>', 'staff');
```

---

## Deployment flexibility

Two supported paths, documented in-app on the **Deployment** page for the owner:

1. **Cloud** — Render (API + Postgres) + Vercel (client). What's running today. ~£15–20/mo at paid tiers.
2. **Self-hosted** — run the whole stack via `docker compose up -d` on a mini PC or NAS with Docker support. One-off hardware cost, near-zero ongoing.

Both use the exact same codebase. Switching between them is a data export + import.

---

## Phase 2b — still to land

- **Historical data import** from the uncle's existing Google Sheet (one-off Node script, idempotent)
- **Insights page** with Recharts — daily takings line chart with rolling 7-day average, day-of-week breakdown, event-correlation markers, simple moving-average forecast, quarter/year tiles
