# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-09-22 05:59
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('geo', '0007_auto_20170922_0551'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='geoarea',
            name='name',
        ),
    ]
