# Generated by Django 3.2.3 on 2021-06-10 07:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("venues", "0007_auto_20210531_0422"),
    ]

    operations = [
        migrations.AlterField(
            model_name="venue",
            name="ic_contact_number",
            field=models.CharField(max_length=50, null=True),
        ),
        migrations.AlterField(
            model_name="venue",
            name="ic_email",
            field=models.EmailField(max_length=254, null=True),
        ),
        migrations.AlterField(
            model_name="venue",
            name="ic_name",
            field=models.CharField(max_length=255, null=True),
        ),
    ]
