# urGallery

Portfolio platform for artists and creators. Build profiles, customize appearance, and showcase work with multi-page portfolios — no code required.

## Quick Start

```bash
# Backend
cd backend
python manage.py migrate
python manage.py runserver

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Or with Docker:

```bash
docker compose up
```

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/PRD.md](docs/PRD.md) | Product requirements, features, data models, API endpoints, **MVP status** |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Tech stack, frontend, backend, database, storage, auth |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment, env vars, Docker build |
| [docs/UAT_DOCKER_CHECKLIST.md](docs/UAT_DOCKER_CHECKLIST.md) | UAT and smoke test checklist |
| [docs/CUSTOM_COLORS_IMPLEMENTATION.md](docs/CUSTOM_COLORS_IMPLEMENTATION.md) | Custom colors implementation guide |

**Current focus (July 2026):** Pre-production — mobile live portfolio polish, tablet+ typography on original layouts, then Docker UAT and deploy. See [docs/PRD.md#mvp-implementation-status](docs/PRD.md#mvp-implementation-status).

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS, TypeScript
- **Backend:** Django 5.2, Django REST Framework
- **Database:** PostgreSQL
- **Auth:** JWT (HttpOnly cookies)
