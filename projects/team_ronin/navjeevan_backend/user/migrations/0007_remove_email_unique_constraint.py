# Generated migration to remove unique constraint from email field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0006_remove_medicalpersonnel_created_at_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='normaluser',
            name='email',
            field=models.EmailField(max_length=254),
        ),
        migrations.AlterField(
            model_name='medicalpersonnel',
            name='email',
            field=models.EmailField(max_length=254),
        ),
    ]
