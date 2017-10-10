# Getting Started

> Author: *Navin Ayer*

## Building

Install `docker` and `docker-compose v3`

Required everytime dependencies are updated.
```bash
cd deep-project-root
docker-compose build
```

## Running

Usefull commands for:

- Starting docker containers
    ```bash
    docker-compose up               # non-detach mode, shows logs, ctrl+c to exit
    docker-compose up -d            # detach mode, runs in background
    ```
- Viewing logs (for detach mode)
    ```bash
    docker-compose logs -f          # view logs -f is for flow
    docker-compose logs -f web      # view logs for web container
    ```
- Running commands
    ```bash
    docker-compose exec web <command>    # Run command inside web container
    docker-compose exec web bash         # Get into web container bash
    ```

[Note: `web` is the container name (view `docker-compose.yml`)]

## Adding dependencies

- Get into web container bash

    ```bash
    docker-compose exec web bash
    ```

- Adding Frontend Dependencies [JS]

    ```bash
    cd frontend/
    yarn add <dependency>       # Installs dependency and updates package.json and yarn.lock
    ```

- Adding Backend Dependencies [Python]

    - Avoid `pip freeze > requirements.txt`

    - Temporary Dependency install [Dependency might not be in next `docker-compose up`]
    ```bash
    cd backend/
    . /venv/bin/activate                     # Activate virtualenv
    pip3 install <dependency>                # Install dependency
    pip3 freeze | grep <dependency>          # Get depedency version
    vim requirements.txt                     # Update python requirements [This will exist in next up]
    ```
    - Permanent Dependency install
        - `docker-compose build` after `requirements.txt` is updated

## Running tests locally

- Initial commands
    ```bash
    docker-compose exec web bash

    # Inside container
    . /venv/bin/activate
    ```

- Overall project test
    ```bash
    # Inside container
    tox                         # Overall project test
    ```

- Python/Django test
    ```bash
    # Inside container
    cd /code/backend/
    python3 manage.py test                      # Overall django test
    python3 manage.py test <app.module>         # specific app module test
    ```

- JS/React test
    ```bash
    # Inside container
    cd /code/frontend/
    yarn test                   # Provides different usage
    yarn test a                 # Overall JS/React test
    yarn test o                 # test only changes files
    yarn test --coverage        # Also generate coverage
    ```
