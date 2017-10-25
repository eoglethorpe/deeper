# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-10-24 12:06
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis_framework', '0003_auto_20171013_1259'),
    ]

    operations = [
        migrations.AddField(
            model_name='filter',
            name='filter_type',
            field=models.CharField(choices=[('number', 'number'), ('list', 'list')], default='list', max_length=20),
        ),
    ]
