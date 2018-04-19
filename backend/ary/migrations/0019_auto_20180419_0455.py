# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2018-04-19 04:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ary', '0018_merge_20180419_0410'),
    ]

    operations = [
        migrations.AddField(
            model_name='scorescale',
            name='title',
            field=models.CharField(default='Very good', max_length=255),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='scorematrixpillar',
            name='weight',
            field=models.FloatField(default=0.2),
        ),
        migrations.AlterField(
            model_name='scorepillar',
            name='weight',
            field=models.FloatField(default=0.2),
        ),
    ]
