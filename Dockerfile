FROM ubuntu:16.04

RUN apt-get update

RUN apt-get install -y \
        git \
        locales \
        python3 \
        python3-dev \
        python3-setuptools \
        python3-pip

RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8

RUN pip3 install uwsgi

RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install yarn

RUN rm -rf /var/lib/apt/lists/*

RUN mkdir /code/backend -p
RUN mkdir /code/frontend -p
WORKDIR /code

RUN pip3 install virtualenv
RUN virtualenv /venv

COPY backend/requirements.txt /code/backend/
RUN . /venv/bin/activate && pip install -r backend/requirements.txt

COPY frontend/package.json /code/frontend/
RUN cd frontend && yarn install

COPY . /code/
RUN cd frontend && yarn build
