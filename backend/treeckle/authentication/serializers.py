from typing import Optional

from rest_framework import serializers, exceptions

from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings

from users.models import User
from users.logic import user_to_json, get_users
from treeckle.common.constants import REFRESH, EMAIL
from .logic import get_authenticated_data, get_login_details

from .models import (
    AuthenticationData,
    GmailAuthenticationData,
    OpenIdAuthenticationData,
    PasswordAuthenticationData,
)


class BaseAuthenticationSerializer(serializers.Serializer):
    default_error_messages = {"invalid_user": "Invalid user."}

    def raise_invalid_user(self):
        authentication_failed_exception = exceptions.AuthenticationFailed(
            detail=self.error_messages.get("invalid_user"),
            code="invalid_user",
        )
        raise authentication_failed_exception

    def authenticate(self, auth_data: AuthenticationData) -> dict:
        authenticated_user = auth_data.authenticate()

        if authenticated_user is None:
            self.raise_invalid_user()

        return get_authenticated_data(user=authenticated_user)


class GmailLoginSerializer(BaseAuthenticationSerializer):
    token_id = serializers.CharField()

    def validate(self, attrs):
        auth_data = GmailAuthenticationData(attrs)

        return self.authenticate(auth_data)


class OpenIdLoginSerializer(BaseAuthenticationSerializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    user_id = serializers.CharField()

    def validate(self, attrs):
        auth_data = OpenIdAuthenticationData(attrs)

        return self.authenticate(auth_data)


class PasswordLoginSerializer(BaseAuthenticationSerializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        auth_data = PasswordAuthenticationData(attrs)

        return self.authenticate(auth_data)


class AccessTokenRefreshSerializer(
    TokenRefreshSerializer,
    BaseAuthenticationSerializer,
):
    def validate(self, attrs):
        tokens = super().validate(attrs)

        user_id = RefreshToken(tokens[REFRESH]).get(key=api_settings.USER_ID_CLAIM)

        try:
            user = get_users(id=user_id).select_related("organization").get()
        except User.DoesNotExist as e:
            self.raise_invalid_user()

        data = user_to_json(user=user)
        data.update(tokens)

        return data


class CheckAccountSerializer(BaseAuthenticationSerializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs[EMAIL]

        login_details = get_login_details(email=email)

        if login_details is None:
            self.raise_invalid_user()

        return login_details
