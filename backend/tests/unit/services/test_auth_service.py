"""
Unit tests for auth_service.
"""
import pytest

from app.schemas.auth import CurrentUser
from app.services.auth_service import get_me


def test_get_me_returns_me_response_shape():
    """get_me maps CurrentUser to MeResponse with all API spec fields."""
    user = CurrentUser(
        id=42,
        email="artist@example.com",
        first_name="Jane",
        last_name="Doe",
        slug="jane-doe",
        display_name="Jane D.",
        title="Photographer",
        location="Brooklyn",
        bio="Portrait and street.",
        avatar_url="https://cdn.example.com/avatars/42.jpg",
    )
    result = get_me(user)
    assert result.id == 42
    assert result.email == "artist@example.com"
    assert result.first_name == "Jane"
    assert result.last_name == "Doe"
    assert result.slug == "jane-doe"
    assert result.display_name == "Jane D."
    assert result.title == "Photographer"
    assert result.location == "Brooklyn"
    assert result.bio == "Portrait and street."
    assert result.avatar_url == "https://cdn.example.com/avatars/42.jpg"


def test_get_me_normalizes_empty_strings():
    """get_me converts None profile fields to empty strings; avatar_url stays None."""
    user = CurrentUser(
        id=1,
        email="minimal@example.com",
        first_name="",
        last_name="",
        slug="",
        display_name="",
        title="",
        location="",
        bio="",
        avatar_url=None,
    )
    result = get_me(user)
    assert result.id == 1
    assert result.email == "minimal@example.com"
    assert result.first_name == ""
    assert result.last_name == ""
    assert result.slug == ""
    assert result.display_name == ""
    assert result.title == ""
    assert result.location == ""
    assert result.bio == ""
    assert result.avatar_url is None
