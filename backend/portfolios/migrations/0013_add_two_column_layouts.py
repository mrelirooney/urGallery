# Generated manually for two-column layout feature

from django.db import migrations, models


def migrate_old_layouts(apps, schema_editor):
    """
    Migrate existing MediaTop_TextBottom and MediaBottom_TextTop pages
    to MediaLeft_TextRight (default fallback).
    """
    Page = apps.get_model('portfolios', 'Page')
    DraftPage = apps.get_model('portfolios', 'DraftPage')
    
    # Migrate live pages
    Page.objects.filter(
        layout__in=['MediaTop_TextBottom', 'MediaBottom_TextTop']
    ).update(layout='MediaLeft_TextRight')
    
    # Migrate draft pages
    DraftPage.objects.filter(
        layout__in=['MediaTop_TextBottom', 'MediaBottom_TextTop']
    ).update(layout='MediaLeft_TextRight')


def reverse_migrate_layouts(apps, schema_editor):
    """
    Reverse migration - no-op since we can't reliably restore old layouts.
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('portfolios', '0012_draftportfolio_has_unpublished_changes'),
    ]

    operations = [
        # Add new fields to Page model
        migrations.AddField(
            model_name='page',
            name='media_image_2',
            field=models.ImageField(blank=True, null=True, upload_to='portfolio_pages/'),
        ),
        migrations.AddField(
            model_name='page',
            name='media_shape_2',
            field=models.CharField(blank=True, choices=[('1:1', 'Square (1:1)'), ('9:16', 'Vertical (9:16)'), ('16:9', 'Wide (16:9)'), ('4:5', 'Vertical (4:5)'), ('5:4', 'Wide (5:4)')], default='1:1', max_length=4),
        ),
        migrations.AddField(
            model_name='page',
            name='title_2',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='page',
            name='description_2',
            field=models.TextField(blank=True),
        ),
        
        # Add new fields to DraftPage model
        migrations.AddField(
            model_name='draftpage',
            name='media_image_2',
            field=models.ImageField(blank=True, null=True, upload_to='draft_portfolio_pages/'),
        ),
        migrations.AddField(
            model_name='draftpage',
            name='media_shape_2',
            field=models.CharField(blank=True, choices=[('1:1', 'Square (1:1)'), ('9:16', 'Vertical (9:16)'), ('16:9', 'Wide (16:9)'), ('4:5', 'Vertical (4:5)'), ('5:4', 'Wide (5:4)')], default='1:1', max_length=4),
        ),
        migrations.AddField(
            model_name='draftpage',
            name='title_2',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='draftpage',
            name='description_2',
            field=models.TextField(blank=True),
        ),
        
        # Update layout field choices for both models
        migrations.AlterField(
            model_name='page',
            name='layout',
            field=models.CharField(
                choices=[
                    ('MediaLeft_TextRight', 'Media Left • Text Right'),
                    ('MediaRight_TextLeft', 'Media Right • Text Left'),
                    ('TwoColumnMediaOnly', 'Two Column Media Only'),
                    ('TwoColumnMediaWithText', 'Two Column Media With Text'),
                    ('TextOnly', 'Text Only'),
                    ('MediaOnly', 'Media Only'),
                    ('MediaTop_TextBottom', 'Media Top • Text Bottom'),
                    ('MediaBottom_TextTop', 'Media Bottom • Text Top'),
                ],
                default='MediaLeft_TextRight',
                max_length=50
            ),
        ),
        migrations.AlterField(
            model_name='draftpage',
            name='layout',
            field=models.CharField(
                choices=[
                    ('MediaLeft_TextRight', 'Media Left • Text Right'),
                    ('MediaRight_TextLeft', 'Media Right • Text Left'),
                    ('TwoColumnMediaOnly', 'Two Column Media Only'),
                    ('TwoColumnMediaWithText', 'Two Column Media With Text'),
                    ('TextOnly', 'Text Only'),
                    ('MediaOnly', 'Media Only'),
                    ('MediaTop_TextBottom', 'Media Top • Text Bottom'),
                    ('MediaBottom_TextTop', 'Media Bottom • Text Top'),
                ],
                default='MediaLeft_TextRight',
                max_length=50
            ),
        ),
        
        # Data migration: convert old layouts to default
        migrations.RunPython(migrate_old_layouts, reverse_migrate_layouts),
    ]


