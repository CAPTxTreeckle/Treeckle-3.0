# Generated by Django 3.2.5 on 2021-07-28 08:39

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('content_delivery_service', '0002_image_organization'),
        ('users', '0015_user_profile_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='profile_image',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='content_delivery_service.image'),
        ),
    ]