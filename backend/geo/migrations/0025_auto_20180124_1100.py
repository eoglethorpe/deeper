# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2018-01-24 11:00
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('geo', '0024_auto_20180107_0538'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='adminlevel',
            options={'ordering': ['level']},
        ),
    ]
