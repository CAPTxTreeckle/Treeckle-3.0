import os
import requests

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
    USER,
    TOKENS,
)
from treeckle.common.exceptions import InternalServerError, BadRequest
from users.models import User, UserInvite
from users.logic import requester_to_json, get_users, get_user_invites
from email_service.logic import send_password_reset_email
from .logic import get_authenticated_data, reset_password

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
            url="https://graph.facebook.com/v11.0/debug_token",
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

        params = {
            "fields": "id,name,email,picture.width(512).height(512)",
            "access_token": access_token,
        }

        response = requests.get(
            url="https://graph.facebook.com/v11.0/me",
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
            user = (
                get_users(id=user_id)
                .select_related(
                    "organization",
                    "profile_image",
                    "passwordauthentication",
                    "googleauthentication",
                    "facebookauthentication",
                )
                .get()
            )
        except User.DoesNotExist as e:
            self.raise_invalid_user()

        data = requester_to_json(user)

        return {USER: data, TOKENS: tokens}


class CheckAccountSerializer(BaseAuthenticationSerializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs[EMAIL]

        try:
            user = get_users(email=email).get()
            return {EMAIL: user.email, NAME: user.name}
        except User.DoesNotExist as e:
            pass

        try:
            user_invite = get_user_invites(email=email).get()
            return {EMAIL: user_invite.email}
        except UserInvite.DoesNotExist as e:
            pass

        self.raise_invalid_user()


class PasswordResetSerializer(BaseAuthenticationSerializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs[EMAIL]

        try:
            user = get_users(email=email).get()
        except User.DoesNotExist as e:
            self.raise_invalid_user()

        new_password = reset_password(user=user)

        if new_password is None:
            raise InternalServerError(
                detail="An error has occurred while resetting the password.",
                code="fail_to_reset_password",
            )

        send_password_reset_email(user=user, new_password=new_password)

        return {EMAIL: user.email, NAME: user.name}
