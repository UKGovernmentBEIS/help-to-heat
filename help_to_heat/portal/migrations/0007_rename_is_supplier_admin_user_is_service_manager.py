# Generated by Django 3.2.19 on 2023-06-21 13:30

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0006_auto_20230531_1338"),
    ]

    operations = [
        migrations.RenameField(
            model_name="user",
            old_name="is_supplier_admin",
            new_name="is_service_manager",
        ),
    ]