"""
Auth routes: login, me, logout, password reset, etc.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.schemas.auth import CurrentUser, RegisterRequest
from app.services.auth_exceptions import EmailAlreadyInUseError
from app.services.auth_service import get_me, register

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register_endpoint(
    body: RegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Create account. Request: { "email": string, "password": string }.
    Returns 201 { "detail": "Account created successfully" }.
    Returns 400 if email/password missing or email already in use.
    """
    try:
        register(db, body.email, body.password)
    except EmailAlreadyInUseError:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Email already in use")
    except ValueError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))
    return {"detail": "Account created successfully"}


@router.get("/me")
def me(current_user: CurrentUser = Depends(get_current_user)):
    """
    Current user + profile summary. Auth required.
    Returns id, email, first_name, last_name, slug, display_name, title, location, bio, avatar_url.
    """
    return get_me(current_user)
