"""
Tests for POST /api/auth/register. Use test Postgres (see conftest).
"""
import pytest
from sqlalchemy import select

from app.db.models import Profile, User


def test_register_creates_user_and_profile(client, test_db_session):
    """Valid email and password returns 201 and creates User and Profile."""
    response = client.post(
        "/api/auth/register",
        json={"email": "artist@example.com", "password": "securepass123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data == {"detail": "Account created successfully"}

    user = test_db_session.execute(select(User).where(User.email == "artist@example.com")).scalar_one()
    assert user.id >= 1
    assert user.email == "artist@example.com"
    assert user.password_hash.startswith("$2b$")  # bcrypt
    assert user.first_name == ""
    assert user.last_name == ""

    profile = test_db_session.execute(select(Profile).where(Profile.user_id == user.id)).scalar_one()
    assert profile.slug == "artist"
    assert profile.display_name == ""
    assert profile.title == ""
    assert profile.location == ""
    assert profile.bio == ""


def test_register_duplicate_email_returns_400(client, test_db_session):
    """Registering the same email twice returns 400 and only one user exists."""
    payload = {"email": "dupe@example.com", "password": "pass123"}
    r1 = client.post("/api/auth/register", json=payload)
    assert r1.status_code == 201

    r2 = client.post("/api/auth/register", json=payload)
    assert r2.status_code == 400
    assert r2.json()["detail"] == "Email already in use"

    count = len(list(test_db_session.execute(select(User).where(User.email == "dupe@example.com")).scalars()))
    assert count == 1


def test_register_missing_email_returns_400(client):
    """Missing email returns 400."""
    response = client.post(
        "/api/auth/register",
        json={"password": "pass123"},
    )
    assert response.status_code == 422  # FastAPI validation error


def test_register_missing_password_returns_400(client):
    """Missing password returns 400."""
    response = client.post(
        "/api/auth/register",
        json={"email": "a@b.com"},
    )
    assert response.status_code == 422
