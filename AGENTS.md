# AGENTS.md

## Cursor Cloud specific instructions

urGallery is a portfolio platform with two services plus a database:

- **Backend** (`backend/`): Django 5.2 + DRF, JWT auth via HttpOnly cookies. Runs on port `8000`.
- **Frontend** (`frontend/`): Next.js 16 (App Router, Turbopack). Runs on port `3000`.
- **Database**: PostgreSQL (`urgallery_dev`, user `postgres`, password in `backend/.env`).

### Starting services (in this order)

1. **PostgreSQL** must be running before the backend. It is installed and the `urgallery_dev`
   database already exists, but the cluster is not auto-started on boot:
   ```bash
   sudo pg_ctlcluster 16 main start
   ```
2. **Backend** (uses the committed `backend/.env`, which points `DATABASE_URL` at `localhost:5432`):
   ```bash
   cd backend
   ./.venv/bin/python manage.py migrate      # only when migrations change
   ./.venv/bin/python manage.py runserver 0.0.0.0:8000
   ```
   The Python venv lives at `backend/.venv` (created by the update script).
3. **Frontend**:
   ```bash
   cd frontend
   npm run dev        # next dev --turbopack on port 3000
   ```

### Non-obvious notes

- The frontend talks to Django through **Next.js rewrites** (see `frontend/next.config.js`):
  `/api/*` and `/media/*` are proxied to `http://localhost:8000`. So in dev you use the app
  entirely via `http://localhost:3000` and `NEXT_PUBLIC_API_BASE` is left empty (relative URLs).
  Hitting the proxied `/api/...` paths with `curl` returns 308 redirects (trailing-slash
  handling); test the backend directly on port `8000` instead when scripting.
- `npm run lint` currently crashes with `TypeError: Converting circular structure to JSON`.
  This is a pre-existing incompatibility between `eslint-config-next@16` (flat config via
  `@eslint/eslintrc` `FlatCompat`) and ESLint 9 — not an environment problem.
- Backend `manage.py test` reports 0 tests: the per-app `tests.py` files are empty stubs.
- In DEBUG mode the email backend is the console backend, so password-reset / help emails
  print to the backend terminal instead of being sent.
