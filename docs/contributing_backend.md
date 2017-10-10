# Contributing

## Project Structure

    . backend
    ├── analysis_framework
    ├── deep
    │   ├── test_files
    ├── entry
    ├── geo
    ├── htmlcov
    ├── jwt_auth
    ├── lead
    ├── project
    ├── redis_store
    ├── user
    ├── user_group
    ├── user_resource
    ├── utils
    │   ├── extractor
    │   ├── hid
    │   └── websocket
    └── websocket


## Python Coding Guideline

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/).

- Use 4 spaces -never tabs. Enough said.

- Multiple Import
    ```python
    # No
    from .serializers import ProjectSerializer, ProjectMembershipSerializer

    # Yes
    from .serializers import (
        ProjectSerializer, ProjectMembershipSerializer
    )
    ```
- Write [unit test](https://docs.djangoproject.com/en/1.11/topics/testing/).

## FAQ

- How to get to python[with django initialization] shell?
    ```
    docker-compose up -d
    docker-compose exec web bash
    . /venv/bin/activate
    python3 backend/manage.py shell
    ```
