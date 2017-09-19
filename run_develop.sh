#!/bin/bash

. /venv/bin/activate
cd backend
python manage.py migrate --no-input
python manage.py createinitialrevisions
python manage.py runserver 0.0.0.0:8000 --noworker &
python manage.py runworker &
celery -A deep worker -l info &

cd ../frontend
yarn add --force node-sass
yarn start
