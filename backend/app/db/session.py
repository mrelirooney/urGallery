"""
Database session: engine and dependency for FastAPI.
"""
from collections.abc import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db.config import get_database_url
from app.db.models import Base

_engine = None
_SessionLocal = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(
            get_database_url(),
            pool_pre_ping=True,
            echo=False,
        )
    return _engine


def get_session_factory():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _SessionLocal


def create_tables(engine=None):
    """Create all tables. Used at app startup and in tests."""
    eng = engine or get_engine()
    Base.metadata.create_all(bind=eng)


def drop_tables(engine=None):
    """Drop all tables. Used in test teardown."""
    eng = engine or get_engine()
    Base.metadata.drop_all(bind=eng)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency: yield a DB session, close after request."""
    factory = get_session_factory()
    session = factory()
    try:
        yield session
    finally:
        session.close()
