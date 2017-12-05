#! /bin/bash

echo "Branch=${TRAVIS_BRANCH}, Pull request=${TRAVIS_PULL_REQUEST}"
echo "************************************************************";

# Don't deploy pull requests
if [ "${TRAVIS_PULL_REQUEST}" == "false" ]; then
    # Check if the branch is release candidate, if yes deploy it
    if [ "${TRAVIS_BRANCH}" == "${DEEP_RC_BRANCH}" ]; then
        echo "Deploying using Release Candidate ${DEEP_RC_BRANCH}";
        ./deploy/deploy_deeper.sh .env-dev ;
    # if not release candidate, check if the branch is develop and is from cronjob
    elif [ "${TRAVIS_BRANCH}" == "${DEEP_DEVELOP_BRANCH}" ] && [ "${TRAVIS_EVENT_TYPE}" == "cron" ]; then
        echo "Deploying using Develop branch ${DEEP_DEVELOP_BRANCH}";
        ./deploy/deploy_deeper.sh .env-dev ;
    fi
fi
