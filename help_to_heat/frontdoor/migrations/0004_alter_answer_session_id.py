# Generated by Django 3.2.19 on 2023-06-08 14:06

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("frontdoor", "0003_alter_event_options"),
    ]

    operations = [
        migrations.AlterField(
            model_name="answer",
            name="session_id",
            field=models.UUIDField(editable=False),
        ),
    ]