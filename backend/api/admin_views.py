import csv
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Profile
from portfolios.models import Comment, Page, Portfolio, Privacy
from saves.models import SavedArtist, SavedPortfolio

User = get_user_model()

VALID_PERIODS = {"all", "7d", "30d", "month"}


class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )


def _period_bounds(period: str):
    now = timezone.now()
    if period == "7d":
        return now - timedelta(days=7), now
    if period == "30d":
        return now - timedelta(days=30), now
    if period == "month":
        return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0), now
    return None, now


def _distribution(queryset, field: str, limit: int = 15):
    rows = (
        queryset.exclude(**{f"{field}__isnull": True})
        .exclude(**{field: ""})
        .values(field)
        .annotate(count=Count("id"))
        .order_by("-count")[:limit]
    )
    total = sum(row["count"] for row in rows) or 1
    return [
        {
            field: row[field],
            "count": row["count"],
            "percent": round((row["count"] / total) * 100, 1),
        }
        for row in rows
    ]


def _count_active_users(since):
    user_ids = set()

    portfolio_qs = Portfolio.objects.exclude(privacy=Privacy.DRAFT)
    if since:
        portfolio_qs = portfolio_qs.filter(
            Q(created_at__gte=since) | Q(updated_at__gte=since)
        )
    user_ids.update(portfolio_qs.values_list("user_id", flat=True))

    page_qs = Page.objects.all()
    if since:
        page_qs = page_qs.filter(created_at__gte=since)
    user_ids.update(page_qs.values_list("portfolio__user_id", flat=True))

    comment_qs = Comment.objects.all()
    if since:
        comment_qs = comment_qs.filter(created_at__gte=since)
    user_ids.update(comment_qs.values_list("author_id", flat=True))

    save_artist_qs = SavedArtist.objects.all()
    save_portfolio_qs = SavedPortfolio.objects.all()
    if since:
        save_artist_qs = save_artist_qs.filter(created_at__gte=since)
        save_portfolio_qs = save_portfolio_qs.filter(created_at__gte=since)
    user_ids.update(save_artist_qs.values_list("user_id", flat=True))
    user_ids.update(save_portfolio_qs.values_list("user_id", flat=True))

    if since:
        user_ids.update(
            Profile.objects.filter(updated_at__gte=since).values_list("user_id", flat=True)
        )

    user_ids.discard(None)
    return len(user_ids)


def build_admin_analytics(period: str):
    since, _until = _period_bounds(period)

    total_users = User.objects.count()
    total_portfolios = Portfolio.objects.exclude(privacy=Privacy.DRAFT).count()
    total_pages = Page.objects.count()
    total_comments = Comment.objects.count()
    total_saves = SavedArtist.objects.count() + SavedPortfolio.objects.count()
    public_portfolios = Portfolio.objects.filter(privacy=Privacy.PUBLIC).count()
    private_portfolios = Portfolio.objects.filter(privacy=Privacy.PRIVATE).count()

    if since:
        new_users = User.objects.filter(date_joined__gte=since).count()
        new_portfolios = Portfolio.objects.filter(created_at__gte=since).exclude(
            privacy=Privacy.DRAFT
        ).count()
        new_pages = Page.objects.filter(created_at__gte=since).count()
        new_comments = Comment.objects.filter(created_at__gte=since).count()
        new_saves = (
            SavedArtist.objects.filter(created_at__gte=since).count()
            + SavedPortfolio.objects.filter(created_at__gte=since).count()
        )
        active_users = _count_active_users(since)
    else:
        new_users = total_users
        new_portfolios = total_portfolios
        new_pages = total_pages
        new_comments = total_comments
        new_saves = total_saves
        active_users = _count_active_users(None)

    return {
        "period": period,
        "generated_at": timezone.now().isoformat(),
        "overview": {
            "total_users": total_users,
            "new_users": new_users,
            "active_users": active_users,
            "total_portfolios": total_portfolios,
            "new_portfolios": new_portfolios,
            "total_pages": total_pages,
            "new_pages": new_pages,
            "total_comments": total_comments,
            "new_comments": new_comments,
            "total_saves": total_saves,
            "new_saves": new_saves,
            "public_portfolios": public_portfolios,
            "private_portfolios": private_portfolios,
        },
        "titles": _distribution(Profile.objects.all(), "title"),
        "locations": _distribution(Profile.objects.all(), "location"),
    }


def analytics_to_csv(data: dict) -> str:
    import io

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["urGallery Admin Analytics"])
    writer.writerow(["Period", data["period"]])
    writer.writerow(["Generated at", data["generated_at"]])
    writer.writerow([])

    writer.writerow(["Overview"])
    writer.writerow(["Metric", "Value"])
    for key, value in data["overview"].items():
        writer.writerow([key, value])
    writer.writerow([])

    writer.writerow(["Top titles"])
    writer.writerow(["Title", "Count", "Percent"])
    for row in data["titles"]:
        writer.writerow([row["title"], row["count"], row["percent"]])
    writer.writerow([])

    writer.writerow(["Top locations"])
    writer.writerow(["Location", "Count", "Percent"])
    for row in data["locations"]:
        writer.writerow([row["location"], row["count"], row["percent"]])

    return buffer.getvalue()


class AdminAnalyticsView(APIView):
    """
    GET /api/admin/analytics/?period=all|7d|30d|month&format=json|csv
    Superuser only.
    """

    permission_classes = [IsSuperUser]

    def get(self, request):
        period = (request.query_params.get("period") or "all").lower()
        if period not in VALID_PERIODS:
            return Response(
                {"detail": f"Invalid period. Use one of: {', '.join(sorted(VALID_PERIODS))}"},
                status=400,
            )

        data = build_admin_analytics(period)
        export_format = (request.query_params.get("format") or "json").lower()

        if export_format == "csv":
            csv_content = analytics_to_csv(data)
            response = HttpResponse(csv_content, content_type="text/csv")
            response["Content-Disposition"] = (
                f'attachment; filename="urgallery-analytics-{period}.csv"'
            )
            return response

        return Response(data)
