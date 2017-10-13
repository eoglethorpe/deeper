# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-10-13 12:59
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('analysis_framework', '0002_auto_20171006_0746'),
    ]

    operations = [
        migrations.AlterField(
            model_name='analysisframework',
            name='created_by',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='analysisframework_created', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='analysisframework',
            name='modified_by',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='analysisframework_modified', to=settings.AUTH_USER_MODEL),
        ),
    ]
