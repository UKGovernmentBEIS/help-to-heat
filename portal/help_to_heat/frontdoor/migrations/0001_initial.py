# Generated by Django 3.2.18 on 2023-05-15 15:57

import uuid

import django.core.serializers.json
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Answer",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("modified_at", models.DateTimeField(auto_now=True)),
                ("data", models.JSONField(encoder=django.core.serializers.json.DjangoJSONEncoder)),
                ("page_name", models.CharField(editable=False, max_length=128)),
                ("session_id", models.UUIDField(default=uuid.uuid4, editable=False)),
            ],
        ),
        migrations.AddConstraint(
            model_name="answer",
            constraint=models.UniqueConstraint(
                fields=("page_name", "session_id"), name="unique answer per page per session"
            ),
        ),
    ]
