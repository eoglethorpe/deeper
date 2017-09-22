#! /bin/bash

# Script base directory [NOTE: keep the script at project root ]
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Goto backend directory
cd $BASE_DIR/backend

. /venv/bin/activate

# Run other test as requeired
coverage run --source='.' manage.py test
codecov --token=$CODECOV_TOKEN
