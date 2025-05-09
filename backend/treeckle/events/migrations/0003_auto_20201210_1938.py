# Generated by Django 3.1.3 on 2020-12-10 19:38

from django.db import migrations, models
import django.db.models.expressions


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0002_auto_20201207_2351"),
    ]

    operations = [
        migrations.AlterField(
            model_name="event",
            name="capacity",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddConstraint(
            model_name="event",
            constraint=models.CheckConstraint(
                check=models.Q(
                    start_date_time__lte=django.db.models.expressions.F("end_date_time")
                ),
                name="valid_start_end_date_time",
            ),
        ),
    ]
