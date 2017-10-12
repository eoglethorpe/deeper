FROM devtc/ubuntu-django-react:latest

MAINTAINER togglecorp info@togglecorp.com

COPY ./deploy/scripts/remote2_syslog_init.sh /tmp/
RUN /tmp/remote2_syslog_init.sh

RUN mkdir /code/backend -p && \
    mkdir /code/frontend -p
WORKDIR /code

RUN pip3 install virtualenv
RUN virtualenv /venv

COPY backend/requirements.txt /code/backend/
RUN . /venv/bin/activate && \
    pip install -r backend/requirements.txt

COPY frontend/package.json /code/frontend/
RUN cd frontend && \
    yarn install

COPY . /code/

CMD ./deploy/scripts/eb_exec.sh
