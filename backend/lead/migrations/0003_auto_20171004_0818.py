# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-10-04 08:18
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lead', '0002_auto_20170929_1201'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='lead',
            options={'ordering': ['-modified_at', '-created_at']},
        ),
    ]
