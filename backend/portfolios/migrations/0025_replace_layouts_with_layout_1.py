# Migration: Replace all layout options with layout-1 only

from django.db import migrations, models


def migrate_to_layout_1(apps, schema_editor):
    Page = apps.get_model("portfolios", "Page")
    DraftPage = apps.get_model("portfolios", "DraftPage")
    Page.objects.all().update(layout="layout-1")
    DraftPage.objects.all().update(layout="layout-1")


def reverse_migrate(apps, schema_editor):
    # Cannot reliably restore old layout values
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("portfolios", "0024_add_portfolio_password"),
    ]

    operations = [
        migrations.RunPython(migrate_to_layout_1, reverse_migrate),
        migrations.AlterField(
            model_name="page",
            name="layout",
            field=models.CharField(
                choices=[("layout-1", "layout-1")],
                default="layout-1",
                max_length=50,
            ),
        ),
        migrations.AlterField(
            model_name="draftpage",
            name="layout",
            field=models.CharField(
                choices=[("layout-1", "layout-1")],
                default="layout-1",
                max_length=50,
            ),
        ),
    ]
