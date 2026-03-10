"""
Pytest fixtures: test Postgres via testcontainers, and FastAPI test client with DB override.
The test database is created when the suite runs and dropped when the run ends (container removed).
Register tests require Docker to be running (testcontainers starts postgres:15).
"""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from testcontainers.postgres import PostgresContainer

from app.db.models import Base
from app.db import session as db_session


def _import_app():
    """Import app after env is set so create_tables uses test DB when lifespan runs."""
    from app.main import app
    return app


@pytest.fixture(scope="session")
def postgres_container():
    """Start a Postgres 15 container for the entire test session. Dropped when session ends."""
    with PostgresContainer("postgres:15") as postgres:
        yield postgres


@pytest.fixture(scope="session")
def test_engine(postgres_container):
    """Create SQLAlchemy engine for the test Postgres and create all tables.
    Sets DATABASE_URL so app lifespan (create_tables) uses the test DB when client is used.
    """
    url = postgres_container.get_connection_url()
    old_url = os.environ.get("DATABASE_URL")
    os.environ["DATABASE_URL"] = url
    try:
        engine = create_engine(url, pool_pre_ping=True)
        Base.metadata.create_all(bind=engine)
        yield engine
    finally:
        Base.metadata.drop_all(bind=engine)
        if old_url is not None:
            os.environ["DATABASE_URL"] = old_url
        else:
            os.environ.pop("DATABASE_URL", None)
        # Clear cached engine/session so next run or prod uses fresh config
        db_session._engine = None
        db_session._SessionLocal = None


@pytest.fixture(scope="function")
def test_db_session(test_engine):
    """Per-test DB session. Tables are truncated after each test for isolation."""
    Session = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = Session()
    try:
        yield session
    finally:
        session.rollback()
        session.execute(text("TRUNCATE TABLE profiles, users RESTART IDENTITY CASCADE"))
        session.commit()
        session.close()


@pytest.fixture(scope="function")
def client(test_db_session):
    """FastAPI test client with get_db overridden to use the test DB session."""
    app = _import_app()
    def get_db_override():
        try:
            yield test_db_session
        finally:
            pass

    from app.db.session import get_db
    app.dependency_overrides[get_db] = get_db_override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
