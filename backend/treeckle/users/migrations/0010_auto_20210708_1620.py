# Generated by Django 3.2.3 on 2021-07-08 16:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_gmailauthentication'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='third_party_authenticator',
        ),
        migrations.RemoveField(
            model_name='user',
            name='third_party_id',
        ),
        migrations.DeleteModel(
            name='GmailAuthentication',
        ),
    ]