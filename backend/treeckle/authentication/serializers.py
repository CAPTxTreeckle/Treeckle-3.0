import os
import requests
from typing import Optional

from rest_framework import serializers, exceptions

from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings


from treeckle.common.constants import (
    NAME,
    EMAIL,
    USER_ID,
    REFRESH,
    TOKEN_ID,
    ACCESS_TOKEN,
    PASSWORD,
)
from treeckle.common.exceptions import InternalServerError, BadRequest
from users.models import User
from users.logic import user_to_json, get_users
from .logic import get_authenticated_data, get_login_details

from .models import (
    AuthenticationData,
    GoogleAuthenticationData,
    FacebookAuthenticationData,
    OpenIdAuthenticationData,
    PasswordAuthenticationData,
)


class GoogleAuthenticationSerializer(serializers.Serializer):
    token_id = serializers.CharField()

    def validate(self, attrs):
        token_id = attrs[TOKEN_ID]

        params = {"id_token": token_id}

        response = requests.get(
            url="https://oauth2.googleapis.com/tokeninfo",
            params=params,
        )
        response_data = response.json()

        name = response_data.get("name")
        email = response_data.get("email")
        auth_id = response_data.get("sub")

        if not all((name, email, auth_id)):
            raise BadRequest(
                detail="Invalid google token.",
                code="fail_google_token_verification",
            )

        auth_data = GoogleAuthenticationData(
            name=name,
            email=email,
            auth_id=auth_id,
            profile_image=response_data.get("picture", ""),
        )

        return auth_data


FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")
VALID_SCOPES = {"email", "public_profile"}


class FacebookAuthenticationSerializer(serializers.Serializer):
    access_token = serializers.CharField()

    def verify_access_token(self, access_token: str):
        params = {
            "input_token": access_token,
            "access_token": f"{FACEBOOK_APP_ID}|{FACEBOOK_APP_SECRET}",
        }

        response = requests.get(
            url="https://graph.facebook.com/debug_token",
            params=params,
        )

        response_data = response.json()
        data = response_data.get("data")

        if data is None:
            try:
                error_message = response_data.get("error").get("message")

                if not error_message:
                    raise Exception()
            except Exception as e:
                raise BadRequest(
                    detail="Invalid facebook token.",
                    code="fail_facebook_token_verification",
                )

            raise InternalServerError(
                detail=error_message, code="fail_facebook_token_verification"
            )

        app_id = data.get("app_id")
        is_valid = data.get("is_valid")
        scopes = set(data.get("scopes", []))

        if app_id != FACEBOOK_APP_ID or not is_valid or scopes != VALID_SCOPES:
            raise BadRequest(
                detail="Invalid facebook token.",
                code="fail_facebook_token_verification",
            )

    def validate(self, attrs):
        access_token = attrs[ACCESS_TOKEN]

        self.verify_access_token(access_token)

        params = {"fields": "id,name,email,picture", "access_token": access_token}

        response = requests.get(
            url="https://graph.facebook.com/me",
            params=params,
        )
        response_data = response.json()

        try:
            profile_image = response_data.get("picture").get("data").get("url")
        except Exception as e:
            profile_image = ""

        auth_data = FacebookAuthenticationData(
            name=response_data.get("name"),
            email=response_data.get("email"),
            auth_id=response_data.get("id"),
            profile_image=profile_image,
        )

        return auth_data


class PasswordAuthenticationSerializer(serializers.Serializer):
    password = serializers.CharField()

    def validate(self, attrs):
        password = attrs[PASSWORD]

        auth_data = PasswordAuthenticationData(
            name="",
            email="",
            auth_id=password,
        )

        return auth_data


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


class GoogleLoginSerializer(
    GoogleAuthenticationSerializer, BaseAuthenticationSerializer
):
    def validate(self, attrs):
        try:
            auth_data = super().validate(attrs)
        except BadRequest as e:
            self.raise_invalid_user()

        return self.authenticate(auth_data)


class FacebookLoginSerializer(
    FacebookAuthenticationSerializer, BaseAuthenticationSerializer
):
    def validate(self, attrs):
        try:
            auth_data = super().validate(attrs)
        except BadRequest as e:
            self.raise_invalid_user()

        return self.authenticate(auth_data)


class OpenIdLoginSerializer(BaseAuthenticationSerializer):
    name = serializers.CharField()
    email = serializers.EmailField()
    user_id = serializers.CharField()

    def validate(self, attrs):
        name = attrs[NAME]
        email = attrs[EMAIL]
        user_id = attrs[USER_ID]

        email_domain = email[email.rfind("@") + 1 :]
        nusnet_email = f"{user_id}@{email_domain}".lower()

        auth_data = OpenIdAuthenticationData(
            name=name, email=nusnet_email, auth_id=user_id
        )

        return self.authenticate(auth_data)


class PasswordLoginSerializer(
    PasswordAuthenticationSerializer, BaseAuthenticationSerializer
):
    name = serializers.CharField()
    email = serializers.EmailField()

    def validate(self, attrs):
        name = attrs[NAME]
        email = attrs[EMAIL]

        auth_data = super().validate(attrs)
        auth_data.name = name
        auth_data.email = email

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
