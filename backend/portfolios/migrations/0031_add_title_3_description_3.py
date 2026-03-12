# Migration: Add title_3 and description_3 for layout-14 (three-column text blocks)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portfolios", "0030_add_layouts_5_through_15"),
    ]

    operations = [
        migrations.AddField(
            model_name="page",
            name="title_3",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="page",
            name="description_3",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="draftpage",
            name="title_3",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="draftpage",
            name="description_3",
            field=models.TextField(blank=True),
        ),
    ]
