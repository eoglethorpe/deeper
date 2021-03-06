from rest_framework import status
from rest_framework.test import APITestCase

from user.tests.test_apis import AuthMixin
from geo.models import Region, AdminLevel, GeoArea
from project.tests.test_apis import ProjectMixin


class RegionMixin():
    """
    Create or get region mixin
    """
    def create_or_get_region(self, public=True):
        region = Region.objects.filter(public=public).first()
        if not region:
            region = Region.objects.create(
                code='NLP',
                title='Nepal',
                public=public,
            )
        return region


class RegionTests(AuthMixin, ProjectMixin, RegionMixin, APITestCase):
    """
    Region Tests
    """
    def setUp(self):
        """
        Get HTTP_AUTHORIZATION Header
        """
        self.super_auth = self.get_super_auth()
        self.auth = self.get_auth()

    def test_create_region(self):
        """
        Create Region Test
        """

        project = self.create_or_get_project()

        url = '/api/v1/regions/'
        data = {
            'code': 'NLP',
            'title': 'Nepal',
            'data': {'testfield': 'testfile'},
            'public': True,
            'project': project.id,
        }

        response = self.client.post(url, data,
                                    HTTP_AUTHORIZATION=self.auth,
                                    format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Region.objects.count(), 1)
        self.assertEqual(response.data['code'], data['code'])

        self.assertIn(Region.objects.get(id=response.data['id']),
                      project.regions.all())

    def test_clone_region(self):
        """
        Test cloning region
        Includes updating region list of a project whe project id provided
        """
        project = self.create_or_get_project()
        region = self.create_or_get_region()
        project.regions.add(region)

        url = '/api/v1/clone-region/{}/'.format(region.id)
        data = {
            'project': project.id,
        }

        response = self.client.post(url, data,
                                    HTTP_AUTHORIZATION=self.auth,
                                    format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(response.data['id'], region.id)
        self.assertFalse(response.data['public'])
        self.assertFalse(region in project.regions.all())

        new_region = Region.objects.get(id=response.data['id'])
        self.assertTrue(new_region in project.regions.all())

    def test_trigger_api(self):
        """
        Cannot really test for background tasks which happend in separate
        process.

        So create a dummy test and perform actual test in test_tasks
        """
        region = self.create_or_get_region()
        url = '/api/v1/geo-areas-load-trigger/{}/'.format(region.id)
        response = self.client.get(url, HTTP_AUTHORIZATION=self.super_auth)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class AdminLevelTests(AuthMixin, RegionMixin, APITestCase):
    """
    Admin Level Tests
    """
    def setUp(self):
        """
        Get HTTP_AUTHORIZATION Header
        """
        self.auth = self.get_auth()
        self.super_auth = self.get_super_auth()

    def create_or_get_admin_level(self):
        """
        Create Or Update Admin Level
        """
        admin_level = AdminLevel.objects.first()
        if not admin_level:
            admin_level = AdminLevel.objects.create(
                title='test',
                region=self.create_or_get_region(),
            )
        return admin_level

    def test_create_admin_level(self):
        """
        Create Admin Level Test
        """
        url = '/api/v1/admin-levels/'
        data = {
            'region': self.create_or_get_region().pk,
            'title': 'test',
            'name_prop': 'test',
            'pcode_prop': 'test',
            'parent_name_prop': 'test',
            'parent_pcode_prop': 'test',
        }

        response = self.client.post(url, data,
                                    HTTP_AUTHORIZATION=self.super_auth,
                                    format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AdminLevel.objects.count(), 1)
        self.assertEqual(response.data['title'], data['title'])


class GeoOptionsApi(AuthMixin, RegionMixin, APITestCase):
    def setUp(self):
        self.auth = self.get_auth()

    def test_geo_options(self):
        region = self.create_or_get_region()
        admin_level1 = AdminLevel.objects.create(
            region=region,
            title='admin1',
        )
        admin_level2 = AdminLevel.objects.create(
            region=region,
            parent=admin_level1,
            title='admin2',
        )
        geo_area1 = GeoArea.objects.create(
            admin_level=admin_level1,
            title='geo1',
        )
        geo_area2 = GeoArea.objects.create(
            admin_level=admin_level2,
            parent=geo_area1,
            title='geo2',
        )

        url = '/api/v1/geo-options/'
        response = self.client.get(url, HTTP_AUTHORIZATION=self.auth,
                                   format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[str(region.id)][1].get('label'),
                         '{} / {}'.format(admin_level2.title,
                                          geo_area2.title))
