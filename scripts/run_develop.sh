#!/bin/bash -x

# django or react
PROG_TYPE=$1

# /code/scripts/
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# /code/
ROOT_DIR=$(dirname "$BASE_DIR")

cd $ROOT_DIR

if [ "${PROG_TYPE}" == "django" ]; then
    . /venv/bin/activate
    cd backend
    pip3 install -r requirements.txt
    python manage.py migrate --no-input
    python manage.py createinitialrevisions
    python manage.py runserver 0.0.0.0:8000 &
    celery -A deep worker -l info
fi

if [ "${PROG_TYPE}" == "react" ]; then
    cd frontend
    yarn add --force node-sass@4.7.2
    yarn start
fi
