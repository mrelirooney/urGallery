"""
Auth-related request/response and internal schemas.
"""
from pydantic import BaseModel, EmailStr


class MeResponse(BaseModel):
    """Response shape for GET /api/auth/me/ (API spec)."""
    id: int
    email: str
    first_name: str = ""
    last_name: str = ""
    slug: str = ""
    display_name: str = ""
    title: str = ""
    location: str = ""
    bio: str = ""
    avatar_url: str | None = None


class CurrentUser(BaseModel):
    """
    Internal representation of the authenticated user + profile.
    Provided by the auth layer (e.g. from JWT/session) to services.
    """
    id: int
    email: str
    first_name: str = ""
    last_name: str = ""
    slug: str = ""
    display_name: str = ""
    title: str = ""
    location: str = ""
    bio: str = ""
    avatar_url: str | None = None

    model_config = {"frozen": True}


class RegisterRequest(BaseModel):
    """Request body for POST /api/auth/register/."""
    email: EmailStr
    password: str
