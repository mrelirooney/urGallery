# Migration: Add layout-5 through layout-15 to portfolio page layout choices

from django.db import migrations, models

LAYOUT_CHOICES = [
    ("layout-1", "layout-1"),
    ("layout-2", "layout-2"),
    ("layout-3", "layout-3"),
    ("layout-4", "layout-4"),
    ("layout-5", "layout-5"),
    ("layout-6", "layout-6"),
    ("layout-7", "layout-7"),
    ("layout-8", "layout-8"),
    ("layout-9", "layout-9"),
    ("layout-10", "layout-10"),
    ("layout-11", "layout-11"),
    ("layout-12", "layout-12"),
    ("layout-13", "layout-13"),
    ("layout-14", "layout-14"),
    ("layout-15", "layout-15"),
]


class Migration(migrations.Migration):

    dependencies = [
        ("portfolios", "0029_add_description_body"),
    ]

    operations = [
        migrations.AlterField(
            model_name="page",
            name="layout",
            field=models.CharField(
                choices=LAYOUT_CHOICES,
                default="layout-1",
                max_length=50,
            ),
        ),
        migrations.AlterField(
            model_name="draftpage",
            name="layout",
            field=models.CharField(
                choices=LAYOUT_CHOICES,
                default="layout-1",
                max_length=50,
            ),
        ),
    ]
