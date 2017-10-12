#!/bin/bash -x

# /code/scripts/
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# /code/
ROOT_DIR=$(dirname "$BASE_DIR")

cd $ROOT_DIR

. /venv/bin/activate
cd backend
python manage.py migrate --no-input
python manage.py createinitialrevisions
python manage.py runserver 0.0.0.0:8000 &
celery -A deep worker -l info &

cd ../frontend
yarn add --force node-sass
yarn start
