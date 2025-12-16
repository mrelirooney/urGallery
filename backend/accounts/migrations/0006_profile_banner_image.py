# Generated manually for banner image feature

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_profile_slug'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='banner_image',
            field=models.ImageField(blank=True, help_text='Banner image displayed behind profile picture', null=True, upload_to='banners/'),
        ),
    ]


