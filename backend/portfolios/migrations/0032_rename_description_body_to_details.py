from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("portfolios", "0031_add_title_3_description_3"),
    ]

    operations = [
        migrations.RenameField(
            model_name="page",
            old_name="description_body",
            new_name="details",
        ),
        migrations.RenameField(
            model_name="draftpage",
            old_name="description_body",
            new_name="details",
        ),
    ]
