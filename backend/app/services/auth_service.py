"""
Auth business logic. Stateless service layer used by auth router.
"""
import re
from sqlalchemy import select
from sqlalchemy.orm import Session

import bcrypt

from app.db.models import Profile, User
from app.schemas.auth import CurrentUser, MeResponse
from app.services.auth_exceptions import EmailAlreadyInUseError


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _slug_from_email(email: str) -> str:
    """Derive a URL-safe slug from email (e.g. user@example.com -> user-example-com)."""
    local = email.split("@")[0].lower()
    slug = re.sub(r"[^a-z0-9]+", "-", local).strip("-") or "user"
    return slug[:255]


def _unique_slug(session: Session, base_slug: str, exclude_user_id: int | None = None) -> str:
    """Ensure slug is unique; if taken, append -2, -3, ..."""
    slug = base_slug
    n = 2
    while True:
        stmt = select(Profile).where(Profile.slug == slug)
        if exclude_user_id is not None:
            stmt = stmt.where(Profile.user_id != exclude_user_id)
        if session.execute(stmt).scalar_one_or_none() is None:
            return slug
        slug = f"{base_slug}-{n}"[:255]
        n += 1


def register(session: Session, email: str, password: str) -> None:
    """
    Create a new user and profile. Email must be unique.
    Raises EmailAlreadyInUseError if email is already registered.
    """
    email = email.strip().lower()
    if not email or not password:
        raise ValueError("email and password are required")
    existing = session.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if existing is not None:
        raise EmailAlreadyInUseError("Email already in use")
    password_hash = _hash_password(password)
    user = User(
        email=email,
        password_hash=password_hash,
        first_name="",
        last_name="",
    )
    session.add(user)
    session.flush()  # get user.id
    base_slug = _slug_from_email(email)
    slug = _unique_slug(session, base_slug, exclude_user_id=None)
    profile = Profile(
        user_id=user.id,
        slug=slug,
        display_name="",
        title="",
        location="",
        bio="",
        avatar_url=None,
    )
    session.add(profile)
    session.commit()


def get_me(current_user: CurrentUser) -> MeResponse:
    """
    Build the "current user + profile summary" response for GET /api/auth/me/.
    Maps internal CurrentUser to the public MeResponse shape (API spec).
    """
    return MeResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name or "",
        last_name=current_user.last_name or "",
        slug=current_user.slug or "",
        display_name=current_user.display_name or "",
        title=current_user.title or "",
        location=current_user.location or "",
        bio=current_user.bio or "",
        avatar_url=current_user.avatar_url,
    )
