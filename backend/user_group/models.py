from django.contrib.auth.models import User
from django.db import models


class UserGroup(models.Model):
    """
    User group model
    """
    title = models.CharField(max_length=255, blank=True)
    display_picture = models.FileField(upload_to='group_dp/',
                                       null=True, blank=True, default=None)
    members = models.ManyToManyField(User, blank=True,
                                     through='GroupMembership')
    global_crisis_monitoring = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    @staticmethod
    def get_for(user):
        """
        UserGroup can be accessed only if user is a member
        """
        return UserGroup.objects.filter(members=user).distinct()

    def can_get(self, user):
        return user in self.members.all()

    def can_modify(self, user):
        return GroupMembership.objects.filter(
            group=self,
            member=user,
            role='admin',
        ).exists()


class GroupMembership(models.Model):
    """
    User group-Member relationship attributes
    """
    ROLES = [
        ('normal', 'Normal'),
        ('admin', 'Admin'),
    ]

    member = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(UserGroup, on_delete=models.CASCADE)
    role = models.CharField(max_length=100, choices=ROLES,
                            default='normal')
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return '{} @ {}'.format(str(self.member),
                                self.group.title)

    @staticmethod
    def get_for(user):
        return GroupMembership.objects.filter(
            group__members=user).distinct()

    def can_get(self, user):
        return self.group.can_get(user)

    def can_modify(self, user):
        return self.group.can_modify(user)
