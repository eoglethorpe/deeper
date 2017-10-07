# DEEP

[![Build Status](https://travis-ci.org/eoglethorpe/deeper.svg?branch=develop)](https://travis-ci.org/eoglethorpe/deeper)

[![Code Climate](https://codeclimate.com/github/eoglethorpe/deeper/badges/gpa.svg)](https://codeclimate.com/github/eoglethorpe/deeper)
[![Issue Count](https://codeclimate.com/github/eoglethorpe/deeper/badges/issue_count.svg)](https://codeclimate.com/github/eoglethorpe/deeper)


![Coverage(Codecov) Tree](https://codecov.io/gh/eoglethorpe/deeper/branch/develop/graphs/tree.svg)

## Installation

### Requirements

* [Docker (1.13.0+)](https://docs.docker.com/engine/installation/)
* [docker-compose](https://github.com/docker/compose/releases)

### Build docker image

```
$ docker-compose build
```

Or, you can use docker:

```
$ docker build . -t deeper_web
```

### Running locally

```
$ docker-compose up
```

### Running on production

Copy *production.envsample* to *production.env* and modify the environment settings to match postgres database settings.

Make sure to also modify `ALLOWED_HOST`.

The production configuration for docker-compose is in *production.yml*.

```
$ docker-compose -f production.yml build
$ docker-compose -f production.yml up -d
```

