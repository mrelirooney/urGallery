# Migration: Add layout-2 to portfolio page layout choices

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portfolios", "0025_replace_layouts_with_layout_1"),
    ]

    operations = [
        migrations.AlterField(
            model_name="page",
            name="layout",
            field=models.CharField(
                choices=[
                    ("layout-1", "layout-1"),
                    ("layout-2", "layout-2"),
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
                ],
                default="layout-1",
                max_length=50,
            ),
        ),
    ]
