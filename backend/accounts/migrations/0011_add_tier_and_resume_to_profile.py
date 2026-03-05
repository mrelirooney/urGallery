from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0010_add_font_family"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="tier",
            field=models.CharField(
                choices=[("free", "Free"), ("pro", "Pro"), ("premium", "Premium")],
                default="free",
                help_text="Subscription tier; updated by Stripe webhooks",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="profile",
            name="resume_file",
            field=models.FileField(
                blank=True,
                help_text="Optional resume PDF shown on artist profile",
                null=True,
                upload_to="resumes/",
            ),
        ),
    ]
