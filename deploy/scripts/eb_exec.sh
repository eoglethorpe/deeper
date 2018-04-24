#! /bin/bash

# /code/deploy/scripts/
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# /code/
ROOT_DIR=$(dirname "$(dirname "$BASE_DIR")")
instid=`curl -s -o - http://169.254.169.254/latest/meta-data/instance-id`

if [ -z "$IN_CERN" ]; then
    export EBS_HOSTNAME=${DEPLOYMENT_ENV_NAME}_${instid}
else # In cern
    export EBS_HOSTNAME=${DEPLOYMENT_ENV_NAME}_${instid}_CERN
fi

### Aws scripts
printenv | sed 's/^\([a-zA-Z0-9_]*\)=\(.*\)$/export \1="\2"/g' > /aws-script/env_var.sh
crontab $ROOT_DIR/deploy/cronjobs
cron

### PAPERTRAIL CONFIGS
cp $ROOT_DIR/deploy/configs/log_files.yml-sample /etc/log_files.yml
sed "s/hostname:.*/hostname: $EBS_HOSTNAME/" -i /etc/log_files.yml
sed "s/host:.*/host: $PAPERTRAIL_HOST/" -i /etc/log_files.yml
sed "s/port:.*/port: $PAPERTRAIL_PORT/" -i /etc/log_files.yml
service remote_syslog start # start remote_syslog for papaertail log collecter
###

. /venv/bin/activate

echo 'System Info:'
echo 'HOSTNAME:     ' ${EBS_HOSTNAME}
echo 'EBS_ENV_TYPE: ' ${EBS_ENV_TYPE}
echo 'WORKER_TYPE:  ' ${WORKER_TYPE}
echo 'Allowed Host: ' ${DJANGO_ALLOWED_HOST}
echo '######################################'

# To start workers [Channels/Celery]
if [ "$EBS_ENV_TYPE" == "worker" ]; then
    echo 'Worker Environment'
    export DJANGO_ALLOWED_HOST=$DJANGO_ALLOWED_HOST_WEBSOCKET
    cd $ROOT_DIR/backend

    if [ "$WORKER_TYPE" == "celery" ]; then
        echo '>> Starting Celery Worker'
        # Start celery
        mkdir -p /var/log/celery/
        celery -A deep worker --quiet -l info --logfile=/var/log/celery/celery.log
    elif [ "$WORKER_TYPE" == "channel" ]; then
        echo '>> Starting Django Channels'
        # Start channels
        mkdir -p /var/log/daphne/
        daphne -b 0.0.0.0 -p 80 --access-log /var/log/daphne/access.log deep.asgi:channel_layer \
            >> /var/log/daphne/access.log 2>&1 &
        python3 manage.py runworker >> /var/log/daphne/access.log 2>&1
    fi

fi

# To start Django Server [API]
if [ "$EBS_ENV_TYPE" == "web" ]; then

    echo 'API Environment'
    export DJANGO_ALLOWED_HOST=$DJANGO_ALLOWED_HOST_API
    python3 $ROOT_DIR/backend/manage.py collectstatic --no-input >> /var/log/deep.log 2>&1
    python3 $ROOT_DIR/backend/manage.py migrate --no-input >> /var/log/deep.log 2>&1

    uwsgi --ini $ROOT_DIR/deploy/configs/uwsgi.ini # Start uwsgi server
fi
