# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-12-11 11:04
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('analysis_framework', '0010_auto_20171208_0617'),
    ]

    operations = [
        migrations.RenameField(
            model_name='exportable',
            old_name='widget_id',
            new_name='key',
        ),
        migrations.RenameField(
            model_name='filter',
            old_name='widget_id',
            new_name='key',
        ),
    ]
