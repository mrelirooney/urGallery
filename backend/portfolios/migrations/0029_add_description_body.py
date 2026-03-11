# Migration: Add description_body for layout-4 (body/paragraph text)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portfolios", "0028_add_layout_4"),
    ]

    operations = [
        migrations.AddField(
            model_name="page",
            name="description_body",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="draftpage",
            name="description_body",
            field=models.TextField(blank=True),
        ),
    ]
