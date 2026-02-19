# Generated for font customization feature

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0009_add_color_customization'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='font_family',
            field=models.CharField(
                blank=True,
                help_text='Google Font name for profile and portfolio sections (default: Raleway)',
                max_length=64,
                null=True,
            ),
        ),
    ]
