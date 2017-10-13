# Testing

> Authors: *Bibek Dahal*, *Navin Ayer*

Tests are written using django/django-rest test class. Tests files are stored in *tests* directory which lies inside each apps and utils modules.

      ▾ docs/
          mixin_backend.md
      ▾ backend/
          ▾ project/
            ▾ tests/
              __init__.py
              test_apis.py

##### Following is an example for testing django-rest api.

*backend/project/tests/test_apis.py*
```python

from rest_framework.test import APITestCase
from user.tests.test_apis import AuthMixin
from project.models import Project


class ProjectMixin():
    """
    Project related methods
    """

    def create_or_get_project(self):
        """
        Create new or return recent projects
        """
        project = Project.objects.first()
        # ...
        return project


class ProjectApiTest(AuthMixin, ProjectMixin, APITestCase):
    """
    Project Api Test
    """

    def setUp(self):
        pass

    def test_create_project(self):
        pass
```

##### Following is an example for testing utils.

*backend/project/tests/test_apis.py*
```python

from django.test import TestCase
from utils.extractors import (
    PdfExtractor, DocxExtractor, PptxExtractor
)

class ExtractorTest(TestCase):
    """
    Import Test
    Pdf, Pptx and docx
    Note: Html test is in WebDocument Test
    """
    def setUp(self):
        pass

    def extract(self, extractor, path):
        pass

    def test_docx(self):
        """
        Test Docx import
        """
        pass

```

### Reference:

[Writing django tests](https://docs.djangoproject.com/en/1.11/topics/testing/overview/).

[Writing Api tests](http://www.django-rest-framework.org/api-guide/testing/).

[Test Mixin](mixin_backend.md)
