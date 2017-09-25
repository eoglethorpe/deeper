
from os.path import join

from rest_framework import status
from rest_framework.test import APITestCase
from django.conf import settings

from user.tests.test_apis import AuthMixin
from project.tests.test_apis import ProjectMixin
from lead.models import Lead


class LeadMixin():
    """
    Lead Related methods
    """
    URL = '/api/v1/leads/'

    def create_or_get_lead(self):
        """
        Create new or return recent lead
        """
        lead = Lead.objects.first()
        if not lead:
            lead = Lead.objects.create(
                title='Test lead',
                project=self.create_or_get_project(),
                source='Test source',
                confidentiality=Lead.UNPROTECTED,
                status=Lead.PENDING,
                text='Random text',
            )

        return lead


class LeadTests(AuthMixin, ProjectMixin, LeadMixin, APITestCase):
    """
    Lead Tests
    """
    def setUp(self):
        """
        Get HTTP_AUTHORIZATION Header
        """
        self.auth = self.get_auth()

    def test_create_lead(self):
        """
        Create Lead Test
        """

        data = {
            'title': 'test title',
            'project': self.create_or_get_project().pk,
            'source': 'test source',
            'confidentiality': Lead.UNPROTECTED,
            'status': Lead.PENDING,
            'text': 'this is some random text',
        }

        response = self.client.post(self.URL, data,
                                    HTTP_AUTHORIZATION=self.auth)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Lead.objects.count(), 1)
        self.assertEqual(response.data['title'], data['title'])

    def test_lead_upload(self):
        """
        Lead Upload Test
        """
        lead = self.create_or_get_lead()
        url = self.URL + str(lead.pk) + '/'
        with open(join(settings.TEST_DIR, 'geo.json'),
                  'rb') as fp:
            data = {'attachment': fp}
            response = self.client.patch(url, data,
                                         HTTP_AUTHORIZATION=self.auth)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
