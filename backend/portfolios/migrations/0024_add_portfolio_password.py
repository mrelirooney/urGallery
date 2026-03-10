# Migration: add password field for private portfolios

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portfolios", "0023_rename_link_only_to_private"),
    ]

    operations = [
        migrations.AddField(
            model_name="portfolio",
            name="password",
            field=models.CharField(blank=True, default="", max_length=128),
        ),
        migrations.AddField(
            model_name="draftportfolio",
            name="password",
            field=models.CharField(blank=True, default="", max_length=128),
        ),
    ]
