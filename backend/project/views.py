from rest_framework import viewsets
from rest_framework import permissions

from deep.permissions import ModifyPermission

from .models import Project, ProjectMembership
from .serializers import ProjectSerializer, ProjectMembershipSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated,
                          ModifyPermission]

    def get_queryset(self):
        return Project.get_for(self.request.user)


class ProjectMembershipViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectMembershipSerializer
    permission_classes = [permissions.IsAuthenticated,
                          ModifyPermission]

    def get_queryset(self):
        return ProjectMembership.get_for(self.request.user)
