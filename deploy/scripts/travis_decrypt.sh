#! /bin/bash

# configs for travis_deploy.sh
if [ "${TRAVIS_PULL_REQUEST}" == "false" ]; then
    if [ "${TRAVIS_BRANCH}" == "${DEEP_RC_BRANCH}" ]; then

        openssl aes-256-cbc -k "$encrypted_dev_key" -in .env-dev.enc -out .env-dev -d

    elif [ "${TRAVIS_BRANCH}" == "${DEEP_DEVELOP_BRANCH}" ] && [ "${TRAVIS_EVENT_TYPE}" == "cron" ]; then

        openssl aes-256-cbc -k "$encrypted_dev_key" -in .env-dev.enc -out .env-dev -d

    elif [ "${TRAVIS_BRANCH}" == "${DEEP_RC_PROD_BRANCH}" ]; then

        openssl aes-256-cbc -k "$encrypted_prod_key" -in .env-prod.enc -out .env-prod -d
    fi
fi
