# urGallery Backend (FastAPI)

Minimal FastAPI API with a health check, ready for Docker deployment. Package management uses [uv](https://docs.astral.sh/uv/).

## Run locally (uv)

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000  
- Health: http://localhost:8000/health  
- OpenAPI: http://localhost:8000/docs  

## Run with Docker

From repo root:

```bash
docker build -t urgallery-api ./backend
docker run -p 8000:8000 urgallery-api
```

Then open http://localhost:8000/health

## Database

Postgres (e.g. `docker compose up -d db` from repo root). Uses `DATABASE_URL` (default: `postgresql://postgres:LittleIsland052121@localhost:5432/urgallery_dev`). Tables are created on startup. Models: `User` and `Profile` (1:1) in `app/db/models.py`.

## Tests

Run: `uv run pytest -v`. Auth service tests need no DB. Register tests require Docker (testcontainers starts Postgres 15 for the run and removes it when done). Without Docker, run only service tests: `uv run pytest tests/unit/services/ -v`.
