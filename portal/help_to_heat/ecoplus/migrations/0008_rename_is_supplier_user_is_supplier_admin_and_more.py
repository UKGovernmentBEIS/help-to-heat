# Generated by Django 4.2 on 2023-04-13 13:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ecoplus', '0007_rename_is_supplier_user_user_is_supplier'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='is_supplier',
            new_name='is_supplier_admin',
        ),
        migrations.AddField(
            model_name='user',
            name='is_team_leader',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='is_team_member',
            field=models.BooleanField(default=False),
        ),
    ]
