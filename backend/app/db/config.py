"""
Database connection configuration. Uses DATABASE_URL from environment.
Compatible with docker-compose: postgres://postgres:PASSWORD@db:5432/urgallery_dev
"""
import os

# Default for local dev when running against docker-compose db (localhost:5432)
# In Docker, backend service gets DATABASE_URL from env (e.g. postgres://...@db:5432/urgallery_dev)
DEFAULT_URL = "postgresql://postgres:LittleIsland052121@localhost:5432/urgallery_dev"


def get_database_url() -> str:
    raw = os.environ.get("DATABASE_URL", "").strip() or DEFAULT_URL
    # SQLAlchemy + psycopg2 expect postgresql://; some envs set postgres://
    if raw.startswith("postgres://"):
        raw = "postgresql://" + raw[len("postgres://") :]
    return raw
