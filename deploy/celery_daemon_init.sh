curl -L -o /etc/init.d/celeryd "https://raw.githubusercontent.com/celery/celery/3.1/extra/generic-init.d/celeryd"
chmod +x /etc/init.d/celeryd
update-rc.d celeryd defaults
