"""
Auth dependencies: current user resolution for protected routes.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schemas.auth import CurrentUser

_security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_security),
) -> CurrentUser:
    """
    Resolve the current authenticated user. Requires a Bearer token.
    Returns 401 if missing or invalid.
    TODO: Replace with JWT validation and user load from DB.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    # Placeholder: accept any non-empty token and return a stub user.
    # In production, decode JWT and load user from DB.
    return CurrentUser(
        id=1,
        email="user@example.com",
        first_name="First",
        last_name="Last",
        slug="user-slug",
        display_name="Display Name",
        title="",
        location="",
        bio="",
        avatar_url=None,
    )
