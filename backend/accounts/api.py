# apps/accounts/api.py
from django.contrib.auth import get_user_model
from django.db.models import Q, F, Value as V
from django.db.models.functions import Coalesce, Concat
from rest_framework.decorators import api_view
from rest_framework.response import Response

User = get_user_model()

@api_view(["GET"])
def search_users(request):
    q = (request.GET.get("q") or "").strip()
    if not q:
        return Response({"results": []})

    # display_name fallback: display_name -> "first last" -> username
    qs = (
        User.objects
        .filter(
            Q(username__icontains=q) |
            Q(first_name__icontains=q) |
            Q(last_name__icontains=q)
        )
        .annotate(
            display_name=Coalesce(
                F("display_name"),
                Coalesce(Concat(F("first_name"), V(" "), F("last_name")), F("username"))
            ),
            slug=F("username"),
            # If your avatar field has a different name, replace "avatar" below.
            avatar_url=Coalesce(F("avatar"), V(""))
        )
        .values("slug", "display_name", "username", "avatar_url")[:12]
    )

    return Response({"results": list(qs)})
