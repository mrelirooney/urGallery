"""
User hashtag API - list, add, remove.
"""
import re
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from tags.models import Hashtag, UserHashtag

MAX_HASHTAGS = 5


def normalize_hashtag_name(raw: str) -> str:
    """Strip special chars (except spaces), strip #, return trimmed."""
    s = (raw or "").strip().lstrip("#").strip()
    # Keep letters, numbers, spaces; remove other special chars
    s = re.sub(r"[^\w\s]", "", s)
    return s


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_hashtags_list(request):
    """GET /api/my/hashtags/ - List current user's hashtags."""
    qs = (
        UserHashtag.objects.filter(user=request.user)
        .select_related("hashtag")
        .order_by("created_at")
    )
    data = [
        {"id": uh.id, "name": uh.hashtag.name}
        for uh in qs
    ]
    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def my_hashtags_add(request):
    """POST /api/my/hashtags/ - Add hashtag. Body: { "name": "photographer" }."""
    name = request.data.get("name") or ""
    normalized = normalize_hashtag_name(name)
    if not normalized:
        return Response(
            {"error": "Please enter a hashtag."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check limit
    count = UserHashtag.objects.filter(user=request.user).count()
    if count >= MAX_HASHTAGS:
        return Response(
            {"error": f"You can add up to {MAX_HASHTAGS} hashtags."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Get or create Hashtag (model save enforces lowercase, no #)
    hashtag, _ = Hashtag.objects.get_or_create(
        name=normalized.lower(),
        defaults={},
    )

    # Create UserHashtag (unique_together catches duplicates)
    from django.db import IntegrityError
    try:
        uh = UserHashtag.objects.create(user=request.user, hashtag=hashtag)
    except IntegrityError:
        return Response(
            {"error": "You already have this hashtag."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({"id": uh.id, "name": hashtag.name}, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def my_hashtags_remove(request, pk):
    """DELETE /api/my/hashtags/<id>/ - Remove user's hashtag by UserHashtag id."""
    uh = UserHashtag.objects.filter(user=request.user, id=pk).first()
    if not uh:
        return Response(status=status.HTTP_404_NOT_FOUND)
    uh.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
