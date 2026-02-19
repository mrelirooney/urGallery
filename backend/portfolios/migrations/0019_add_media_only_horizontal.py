# Generated manually for MediaOnlyHorizontal (5:4 image slot)

from django.db import migrations, models

LAYOUT_CHOICES = [
    ("MediaLeft_TextRight", "Media Left • Text Right"),
    ("MediaRight_TextLeft", "Media Right • Text Left"),
    ("HeroLayoutSquare00", "Title Page 1"),
    ("HeroLayoutSquare01", "Title Page 2"),
    ("HeroLayoutVertical01", "Title Page – Vertical Image"),
    ("HeroLayoutHorizontal01", "Title Page – Horizontal Image"),
    ("TwoColumnMediaOnly", "Two Column Media Only"),
    ("TwoColumnMediaWithText", "Two Column Media With Text"),
    ("TextOnly", "Text Only"),
    ("MediaOnly", "Media Only"),
    ("MediaOnlyVertical", "Media Only – Vertical"),
    ("MediaOnlyHorizontal", "Media Only – Horizontal"),
    ("MediaTop_TextBottom", "Media Top • Text Bottom"),
    ("MediaBottom_TextTop", "Media Bottom • Text Top"),
]


class Migration(migrations.Migration):

    dependencies = [
        ("portfolios", "0018_add_hero_layout_horizontal_01"),
    ]

    operations = [
        migrations.AlterField(
            model_name="draftpage",
            name="layout",
            field=models.CharField(
                choices=LAYOUT_CHOICES,
                default="HeroLayoutSquare00",
                max_length=50,
            ),
        ),
        migrations.AlterField(
            model_name="page",
            name="layout",
            field=models.CharField(
                choices=LAYOUT_CHOICES,
                default="HeroLayoutSquare00",
                max_length=50,
            ),
        ),
    ]
