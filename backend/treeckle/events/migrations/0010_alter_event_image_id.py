# Generated by Django 3.2.3 on 2021-07-09 19:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0009_auto_20210531_0422"),
    ]

    operations = [
        migrations.AlterField(
            model_name="event",
            name="image_id",
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
