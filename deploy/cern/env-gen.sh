#! /bin/bash

# /code/deploy/cern/
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# /code/
ROOT_DIR=$(dirname "$(dirname "$BASE_DIR")")

SAMPLE_DIR=$ROOT_DIR/deploy/eb-sample
CURRENT_DIR=$(pwd)

# Passed params
ENV_FILE=${1}

echo "::::: Gettings ENV Variables :::::"

if [ -f "$ENV_FILE" ]; then
    echo "  >> Gettings ENV from file $ENV_FILE "
    source $ENV_FILE
    export $(grep -v '^#' $ENV_FILE | cut -d= -f1)
else
    echo "  >> ENV FILE ${ENV_FILE} NOT FOUND ... Exiting....."
    exit 1
fi

# Additional env
DEPLOYMENT_ENV_NAME=$DEPLOYMENT_ENV_NAME_WORKER
TYPE=worker

set -e;
eval "echo \"$(cat $SAMPLE_DIR/.ebextensions/environmentvariables.config-sample)\"" | \
    jq -r \
        '.option_settings[]|.option_name as $option_name|.value as $value| [$option_name, $value]|join("=")' \
        > $ROOT_DIR/.env-cern
echo 'IN_CERN=True' >> $ROOT_DIR/.env-cern
echo "  >> Exported ENV to file $ROOT_DIR/.env-cern "
set +e;
