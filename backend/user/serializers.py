from django.contrib.auth.models import User
from drf_dynamic_fields import DynamicFieldsMixin
from rest_framework import serializers

from deep.serializers import RemoveNullFieldsMixin
from user.models import Profile
from user.utils import send_password_reset
from project.models import Project
from gallery.models import File

from jwt_auth.recaptcha import validate_recaptcha
from jwt_auth.errors import (UserNotFoundError, InvalidCaptchaError)


class SimpleUserSerializer(RemoveNullFieldsMixin,
                           serializers.ModelSerializer):
    display_name = serializers.CharField(
        source='profile.get_display_name',
        read_only=True,
    )

    class Meta:
        model = User
        fields = ('id', 'display_name', 'email')


class UserSerializer(RemoveNullFieldsMixin,
                     DynamicFieldsMixin, serializers.ModelSerializer):
    organization = serializers.CharField(source='profile.organization',
                                         allow_blank=True)
    language = serializers.CharField(
        source='profile.language',
        allow_null=True,
        required=False,
    )
    display_picture = serializers.PrimaryKeyRelatedField(
        source='profile.display_picture',
        queryset=File.objects.all(),
        allow_null=True,
        required=False,
    )
    display_name = serializers.CharField(
        source='profile.get_display_name',
        read_only=True,
    )
    last_active_project = serializers.PrimaryKeyRelatedField(
        source='profile.last_active_project',
        queryset=Project.objects.all(),
        allow_null=True,
        required=False,
    )
    login_attempts = serializers.IntegerField(
        source='profile.login_attempts',
        read_only=True,
    )

    recaptcha_response = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name',
                  'display_name', 'last_active_project',
                  'login_attempts', 'recaptcha_response',
                  'email', 'organization', 'display_picture',
                  'language')

    def validate_recaptcha_response(self, recaptcha_response):
        if not validate_recaptcha(recaptcha_response):
            raise InvalidCaptchaError

    def validate_last_active_project(self, project):
        if not project.can_get(self.context['request'].user):
            raise serializers.ValidationError('Invalid project')
        return project

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        validated_data.pop('recaptcha_response', None)
        user = super(UserSerializer, self).create(validated_data)
        user.save()
        user.profile = self.update_or_create_profile(user, profile_data)
        send_password_reset(email=validated_data["email"], welcome=True)
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        user = super(UserSerializer, self).update(instance, validated_data)
        if 'password' in validated_data:
            user.set_password(validated_data['password'])
            user.save()
        user.profile = self.update_or_create_profile(user, profile_data)
        return user

    def update_or_create_profile(self, user, profile_data):
        profile, created = Profile.objects.update_or_create(
            user=user, defaults=profile_data
        )
        return profile


class UserPreferencesSerializer(RemoveNullFieldsMixin,
                                serializers.ModelSerializer):
    display_picture = serializers.PrimaryKeyRelatedField(
        source='profile.display_picture',
        queryset=File.objects.all(),
        allow_null=True,
        required=False,
    )
    display_name = serializers.CharField(
        source='profile.get_display_name',
        read_only=True,
    )
    last_active_project = serializers.PrimaryKeyRelatedField(
        source='profile.last_active_project',
        queryset=Project.objects.all(),
        allow_null=True,
        required=False,
    )

    language = serializers.CharField(source='profile.language',
                                     read_only=True)
    fallback_language = serializers.CharField(
        source='profile.get_fallback_language',
        read_only=True,
    )

    class Meta:
        model = User
        fields = ('display_name', 'username', 'email', 'last_active_project',
                  'display_picture', 'is_superuser', 'language',
                  'fallback_language')


class PasswordResetSerializer(RemoveNullFieldsMixin,
                              serializers.Serializer):
    email = serializers.EmailField(required=True)
    recaptcha_response = serializers.CharField(required=True)

    def validate_email(self, email):
        user = User.objects.filter(email=email)
        if not user.exists():
            raise UserNotFoundError
        return email

    def validate_recaptcha_response(self, recaptcha_response):
        if not validate_recaptcha(recaptcha_response):
            raise InvalidCaptchaError

    def save(self):
        send_password_reset(email=self.validated_data["email"])
