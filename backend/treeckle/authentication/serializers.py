from rest_framework import serializers, exceptions

from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings

from users.models import User
from users.logic import user_to_json, get_users
from treeckle.common.constants import REFRESH, TOKEN_ID, NAME, EMAIL, USER_ID
from .logic import (
    get_gmail_user_data,
    get_open_id_user_data,
    authenticate_user,
    get_authenticated_data,
)


class BaseAuthenticationSerializer(serializers.Serializer):
    default_error_messages = {"invalid_user": "Invalid user."}

    def raiseInvalidUser(self):
        authenticationFailedException = exceptions.AuthenticationFailed(
            detail=self.error_messages.get("invalid_user"),
            code="invalid_user",
        )
        raise authenticationFailedException


class GmailLoginSerializer(BaseAuthenticationSerializer):
    token_id = serializers.CharField()

    def validate(self, attrs):
        token_id = attrs[TOKEN_ID]

        user_data = get_gmail_user_data(token_id=token_id)

        authenticated_user = authenticate_user(user_data=user_data)

        if authenticated_user is None:
            self.raiseInvalidUser()

        data = get_authenticated_data(user=authenticated_user)

        return data


class OpenIdLoginSerializer(BaseAuthenticationSerializer):
    email = serializers.EmailField()
    user_id = serializers.CharField()
    name = serializers.CharField()

    def validate(self, attrs):
        name = attrs[NAME]
        user_id = attrs[USER_ID]
        email = attrs[EMAIL]

        user_data = get_open_id_user_data(name=name, email=email, user_id=user_id)

        authenticated_user = authenticate_user(user_data=user_data)

        if authenticated_user is None:
            self.raiseInvalidUser()

        data = get_authenticated_data(user=authenticated_user)

        return data


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
            self.raiseInvalidUser()

        data = user_to_json(user=user)
        data.update(tokens)

        return data
