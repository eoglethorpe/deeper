#!/bin/bash

. /venv/bin/activate
cd backend
python manage.py collectstatic --no-input
python manage.py migrate --no-input
uwsgi --socket /socket/deep.sock --module deep.wsgi --chmod-socket=666 -H /venv

