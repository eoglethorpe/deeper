#!/bin/bash

. /venv/bin/activate
cd backend
python manage.py migrate --no-input
python manage.py createinitialrevisions
python manage.py runserver 0.0.0.0:8000 &

cd ../frontend
yarn add --force node-sass
yarn start
