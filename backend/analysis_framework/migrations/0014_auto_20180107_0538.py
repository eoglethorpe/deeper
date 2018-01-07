# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2018-01-07 05:38
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('analysis_framework', '0013_auto_20171227_0755'),
    ]

    operations = [
        migrations.AlterField(
            model_name='analysisframework',
            name='snapshot_one',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='page_one_framework', to='gallery.File'),
        ),
        migrations.AlterField(
            model_name='analysisframework',
            name='snapshot_two',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='page_two_framework', to='gallery.File'),
        ),
    ]
