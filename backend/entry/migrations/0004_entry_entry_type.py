# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-12-17 05:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('entry', '0003_auto_20171013_1259'),
    ]

    operations = [
        migrations.AddField(
            model_name='entry',
            name='entry_type',
            field=models.CharField(choices=[('excerpt', 'Excerpt'), ('image', 'Excerpt')], default='excerpt', max_length=10),
        ),
    ]
