from django.db import models
from django.contrib.postgres.fields import JSONField

from connector.sources.store import get_sources
from user_resource.models import UserResource

from project.models import Project
from user.models import User


class Connector(UserResource):
    title = models.CharField(max_length=255)
    source = models.CharField(max_length=96, choices=get_sources())
    params = JSONField(default=None, blank=True, null=True)

    users = models.ManyToManyField(User, blank=True,
                                   through='ConnectorUser')
    projects = models.ManyToManyField(Project, blank=True,
                                      through='ConnectorProject')

    def __str__(self):
        return self.title

    @staticmethod
    def get_for(user):
        return Connector.objects.filter(
            models.Q(users=user) |
            models.Q(projects__members=user) |
            models.Q(projects__user_groups__members=user)
        ).distinct()

    def can_get(self, user):
        return self in Connector.get_for(user)

    def can_modify(self, user):
        return ConnectorUser.objects.filter(
            connector=self,
            user=user,
            role='admin',
        ).exists()


class ConnectorUser(models.Model):
    """
    Connector-User relationship attributes
    """

    ROLES = (
        ('normal', 'Normal'),
        ('admin', 'Admin'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    connector = models.ForeignKey(Connector, on_delete=models.CASCADE)
    role = models.CharField(max_length=96, choices=ROLES,
                            default='normal')
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return '{} @ {}'.format(str(self.user), self.connector.title)

    class Meta:
        unique_together = ('user', 'connector')

    @staticmethod
    def get_for(user):
        return ConnectorUser.objects.all()

    def can_get(self, user):
        return True

    def can_modify(self, user):
        return self.connector.can_modify(user)


class ConnectorProject(models.Model):
    """
    Connector-Project relationship attributes
    """

    ROLES = (
        ('self', 'For self only'),
        ('global', 'For all members of project'),
    )

    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    connector = models.ForeignKey(Connector, on_delete=models.CASCADE)
    role = models.CharField(max_length=96, choices=ROLES,
                            default='self')
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return '{} @ {}'.format(str(self.project), self.connector.title)

    class Meta:
        unique_together = ('project', 'connector')

    @staticmethod
    def get_for(user):
        return ConnectorProject.objects.all()

    def can_get(self, user):
        return True

    def can_modify(self, user):
        return self.connector.can_modify(user)
