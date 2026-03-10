"""
urGallery API — FastAPI application.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.db.session import create_tables
from app.routers import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield
    # Shutdown: nothing to do for DB


app = FastAPI(
    title="urGallery API",
    description="Backend API for urGallery portfolio platform.",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(auth.router, prefix="/api")


@app.get("/health", tags=["health"])
def health_check():
    """Simple health check for load balancers and container orchestration."""
    return {"status": "ok"}
