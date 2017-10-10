#! /bin/bash

# Script base directory
# /code/scripts/
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# /code/
ROOT_DIR=$(dirname "$BASE_DIR")

# Goto backend directory
cd $ROOT_DIR

. /venv/bin/activate

# Wait for the database
$BASE_DIR/wait-for-it.sh db:5432

# Run other test as requeired
#coverage run --source='.' manage.py test
#codecov --token=$CODECOV_TOKEN
tox
