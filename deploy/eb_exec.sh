#! /bin/bash

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR=$(dirname "$BASE_DIR")
instid=`curl -s -o - http://169.254.169.254/latest/meta-data/instance-id`
export EBS_HOSTNAME=${DEPLOYMENT_ENV_NAME}_${instid}

### PAPERTRAIL CONFIGS
cp $ROOT_DIR/deploy/log_files_$EBS_ENV_TYPE.yml-sample /etc/log_files.yml
sed "s/hostname:.*/hostname: $EBS_HOSTNAME/" -i /etc/log_files.yml
sed "s/host:.*/host: $PAPERTRAIL_HOST/" -i /etc/log_files.yml
sed "s/port:.*/port: $PAPERTRAIL_PORT/" -i /etc/log_files.yml
service remote_syslog start # start remote_syslog for papaertail log collecter
###

. /venv/bin/activate

# To start workers [Channels/Celery]
if [ "$EBS_ENV_TYPE" == "worker" ]; then
    DJANGO_ALLOWED_HOST=$DJANGO_ALLOWED_HOST_WEBSOCKET
    cd $ROOT_DIR/backend
    daphne -b 0.0.0.0 -p 80 deep.asgi:channel_layer &
    service celeryd start
fi

# To start Django Server [API]
if [ "$EBS_ENV_TYPE" == "web" ]; then
    python3 $ROOT_DIR/backend/manage.py collectstatic --no-input
    python3 $ROOT_DIR/backend/manage.py migrate --no-input

    uwsgi --ini $ROOT_DIR/deploy/uwsgi.ini # Start uwsgi server
fi
