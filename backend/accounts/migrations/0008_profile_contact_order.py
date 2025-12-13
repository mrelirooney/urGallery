# Generated manually for contact order feature

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_profile_contact_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='contact_order',
            field=models.JSONField(blank=True, default=list, help_text="Order of contact fields, e.g. ['instagram_url', 'youtube_url', 'email_contact']"),
        ),
    ]

