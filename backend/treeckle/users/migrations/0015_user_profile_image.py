# Generated by Django 3.2.5 on 2021-07-28 08:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("content_delivery_service", "0001_initial"),
        ("users", "0014_remove_user_profile_image"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="profile_image",
            field=models.OneToOneField(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to="content_delivery_service.image",
            ),
        ),
    ]
