# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2018-02-16 09:31
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('category_editor', '0002_categoryeditor_title'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='categoryeditor',
            options={'ordering': ['-created_at']},
        ),
    ]
