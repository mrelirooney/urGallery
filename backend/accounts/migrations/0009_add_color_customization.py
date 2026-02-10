# Generated manually for color customization feature

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_profile_contact_order'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='background_color',
            field=models.CharField(blank=True, help_text='Background color in hex format (e.g., #faf7f2)', max_length=7, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='foreground_color',
            field=models.CharField(blank=True, help_text='Foreground/UI elements color in hex format (e.g., #11100e)', max_length=7, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='text_color',
            field=models.CharField(blank=True, help_text='Text color in hex format (e.g., #11100e)', max_length=7, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='accent_color',
            field=models.CharField(blank=True, help_text='Accent/highlight color in hex format (e.g., #c96a4a)', max_length=7, null=True),
        ),
    ]
