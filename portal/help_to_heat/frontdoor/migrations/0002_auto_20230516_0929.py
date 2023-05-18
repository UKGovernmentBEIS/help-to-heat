# Generated by Django 3.2.18 on 2023-05-16 09:29

import django.core.serializers.json
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("frontdoor", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Event",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("modified_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=256)),
                ("data", models.JSONField(encoder=django.core.serializers.json.DjangoJSONEncoder)),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.AlterField(
            model_name="answer",
            name="data",
            field=models.JSONField(editable=False, encoder=django.core.serializers.json.DjangoJSONEncoder),
        ),
    ]
