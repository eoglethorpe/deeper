# -*- coding: utf-8 -*-
# Generated by Django 1.11.4 on 2017-12-17 07:07
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gallery', '0004_file_mime_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='file',
            name='file',
            field=models.FileField(blank=True, default=None, max_length=255, null=True, upload_to='gallery/'),
        ),
    ]
