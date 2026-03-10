# Generated migration: rename link_only to private in Portfolio and DraftPortfolio

from django.db import migrations, models


def link_only_to_private(apps, schema_editor):
    Portfolio = apps.get_model("portfolios", "Portfolio")
    DraftPortfolio = apps.get_model("portfolios", "DraftPortfolio")
    Portfolio.objects.filter(privacy="link_only").update(privacy="private")
    DraftPortfolio.objects.filter(privacy="link_only").update(privacy="private")


def private_to_link_only(apps, schema_editor):
    Portfolio = apps.get_model("portfolios", "Portfolio")
    DraftPortfolio = apps.get_model("portfolios", "DraftPortfolio")
    Portfolio.objects.filter(privacy="private").update(privacy="link_only")
    DraftPortfolio.objects.filter(privacy="private").update(privacy="link_only")


class Migration(migrations.Migration):

    dependencies = [
        ("portfolios", "0022_add_comment"),
    ]

    operations = [
        migrations.RunPython(link_only_to_private, private_to_link_only),
        migrations.AlterField(
            model_name="portfolio",
            name="privacy",
            field=models.CharField(
                choices=[("draft", "Draft"), ("private", "Private"), ("public", "Public")],
                default="draft",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="draftportfolio",
            name="privacy",
            field=models.CharField(
                choices=[("draft", "Draft"), ("private", "Private"), ("public", "Public")],
                default="draft",
                max_length=20,
            ),
        ),
    ]
