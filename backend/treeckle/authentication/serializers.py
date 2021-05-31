from django.utils.translation import gettext_lazy as _

from rest_framework import serializers, exceptions

from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings

from users.models import User, ThirdPartyAuthenticator
from users.logic import user_to_json, get_users
from treeckle.common.constants import REFRESH
from .logic import get_gmail_user, authenticate_user, get_authenticated_data


class BaseAuthenticationSerializer(serializers.Serializer):
    default_error_messages = {"invalid_user": _("Invalid user.")}

    def raiseInvalidUser(self):
        authenticationFailedException = exceptions.AuthenticationFailed(
            self.error_messages.get("invalid_user"),
            code="invalid_user",
        )
        raise authenticationFailedException


class GmailLoginSerializer(BaseAuthenticationSerializer):
    token_id = serializers.CharField()

    def validate(self, attrs):
        token_id = attrs["token_id"]

        try:
            temp_user = get_gmail_user(token_id=token_id)

            authenticated_user = authenticate_user(temp_user=temp_user)

            if authenticated_user is None:
                self.raiseInvalidUser()
        except Exception as e:
            self.raiseInvalidUser()

        data = get_authenticated_data(user=authenticated_user)

        return data


class OpenIdLoginSerializer(BaseAuthenticationSerializer):
    email = serializers.EmailField()
    user_id = serializers.CharField()
    name = serializers.CharField()

    def validate(self, attrs):
        name = attrs["name"]
        user_id = attrs["user_id"]
        email = attrs["email"]

        email_domain = email[email.rfind("@") + 1 :]
        nusnet_email = f"{user_id}@{email_domain}".lower()

        temp_user = User(
            name=name,
            email=nusnet_email,
            third_party_authenticator=ThirdPartyAuthenticator.NUSNET,
            third_party_id=user_id,
        )

        authenticated_user = authenticate_user(temp_user=temp_user)

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
        except (User.DoesNotExist, User.MultipleObjectsReturned) as e:
            self.raiseInvalidUser()

        data = user_to_json(user=user)
        data.update(tokens)

        return data
