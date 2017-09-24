#! /bin/bash

# Script base directory [NOTE: keep the script at project root ]
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Goto backend directory
cd $BASE_DIR

. /venv/bin/activate

# Wait for the database
$BASE_DIR/wait-for-it.sh db:5432

# Run other test as requeired
#coverage run --source='.' manage.py test
#codecov --token=$CODECOV_TOKEN
tox
