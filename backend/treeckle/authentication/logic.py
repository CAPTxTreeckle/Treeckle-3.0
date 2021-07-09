from typing import Optional
import requests

from django.db import transaction, IntegrityError

from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User, UserInvite
from users.logic import user_to_json, get_users, get_user_invites
from treeckle.common.constants import (
    REFRESH,
    ACCESS,
    NAME,
    EMAIL,
    AUTH_ID,
    AUTH_CLASS,
    ID_TOKEN,
    SUB,
)
from .models import GmailAuthentication, OpenIdAuthentication


def get_gmail_user_data(token_id: str) -> dict:
    params = {ID_TOKEN: token_id}

    response = requests.get(
        url="https://oauth2.googleapis.com/tokeninfo",
        params=params,
    )
    response_data = response.json()

    return {
        NAME: response_data.get(NAME),
        EMAIL: response_data.get(EMAIL),
        AUTH_ID: response_data.get(SUB),
        AUTH_CLASS: GmailAuthentication,
    }


def get_open_id_user_data(name: str, email: str, user_id: str) -> dict:
    email_domain = email[email.rfind("@") + 1 :]
    nusnet_email = f"{user_id}@{email_domain}".lower()

    return {
        NAME: name,
        EMAIL: email,
        AUTH_ID: user_id,
        AUTH_CLASS: OpenIdAuthentication,
    }


def authenticate_user(user_data: dict) -> Optional[User]:
    ## check if an invite exists
    try:
        user_invite = (
            get_user_invites(email=user_data.get(EMAIL))
            .select_related("organization")
            .get()
        )
    except UserInvite.DoesNotExist as e:
        user_invite = None

    ## check if is existing user
    try:
        user = (
            get_users(
                email=user_data.get(EMAIL),
            )
            .select_related("organization")
            .get()
        )
    except User.DoesNotExist as e:
        user = None

    ## no existing user nor user invite
    if user is None and user_invite is None:
        return None

    ## user invite exists but not user
    if user is None:
        ## create a new user and delete user invite
        try:
            user = User.objects.create(
                organization=user_invite.organization,
                name=user_data.get(NAME, "<no name>"),
                email=user_data.get(EMAIL),
                role=user_invite.role,
            )
        except IntegrityError as e:
            return None

    ## since user exists, user invite should be deleted if it exists
    if user_invite is not None:
        ## delete user invite
        user_invite.delete()

    AuthClass = user_data.get(AUTH_CLASS)
    auth_id = user_data.get(AUTH_ID)

    try:
        auth_class = AuthClass.objects.get(user=user)
        ## matches with given auth_id
        return user if auth_class.is_valid(auth_id) else None
    except AuthClass.DoesNotExist:
        ## proceed to create auth method for user
        pass

    ## try to create auth method for user
    try:
        AuthClass.objects.create(user=user, auth_id=auth_id)
    except IntegrityError as e:
        return None

    return user


def get_tokens(user: User) -> dict:
    refreshToken = RefreshToken.for_user(user)

    return {
        REFRESH: str(refreshToken),
        ACCESS: str(refreshToken.access_token),
    }


def get_authenticated_data(user: User) -> dict:
    data = user_to_json(user)
    tokens = get_tokens(user)

    data.update(tokens)

    return data
