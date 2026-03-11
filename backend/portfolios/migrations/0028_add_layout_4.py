# Migration: Add layout-4 to portfolio page layout choices

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portfolios", "0027_add_layout_3"),
    ]

    operations = [
        migrations.AlterField(
            model_name="page",
            name="layout",
            field=models.CharField(
                choices=[
                    ("layout-1", "layout-1"),
                    ("layout-2", "layout-2"),
                    ("layout-3", "layout-3"),
                    ("layout-4", "layout-4"),
                ],
                default="layout-1",
                max_length=50,
            ),
        ),
        migrations.AlterField(
            model_name="draftpage",
            name="layout",
            field=models.CharField(
                choices=[
                    ("layout-1", "layout-1"),
                    ("layout-2", "layout-2"),
                    ("layout-3", "layout-3"),
                    ("layout-4", "layout-4"),
                ],
                default="layout-1",
                max_length=50,
            ),
        ),
    ]
