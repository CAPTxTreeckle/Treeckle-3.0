from typing import Optional
import requests

from django.db import transaction, IntegrityError

from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User, UserInvite, ThirdPartyAuthenticator
from users.logic import user_to_json, get_users, get_user_invites
from treeckle.common.constants import REFRESH, ACCESS


def get_gmail_user(token_id: str) -> User:
    params = {"id_token": token_id}

    response = requests.get(
        url="https://oauth2.googleapis.com/tokeninfo",
        params=params,
    )
    response_data = response.json()

    return User(
        name=response_data.get("name"),
        email=response_data.get("email"),
        third_party_authenticator=ThirdPartyAuthenticator.GOOGLE,
        third_party_id=response_data.get("sub"),
    )


def authenticate_user(temp_user: User) -> Optional[User]:
    ## check if an invite exists
    try:
        user_invite = (
            get_user_invites(email=temp_user.email).select_related("organization").get()
        )
    except (UserInvite.DoesNotExist, UserInvite.MultipleObjectsReturned) as e:
        user_invite = None

    ## check if is existing user
    try:
        existing_user = (
            get_users(
                email=temp_user.email,
                third_party_id=temp_user.third_party_id,
            )
            .select_related("organization")
            .get()
        )
    except (User.DoesNotExist, User.MultipleObjectsReturned) as e:
        existing_user = None

    if user_invite is None:
        return existing_user

    ## user and user invite both exists (unlikely unless manually added thru django admin)
    if existing_user:
        ## delete user invite
        user_invite.delete()
        return existing_user

    ## create a new user and delete user invite
    try:
        with transaction.atomic():
            new_user = User.objects.create(
                organization=user_invite.organization,
                name=temp_user.name,
                email=temp_user.email,
                third_party_authenticator=temp_user.third_party_authenticator,
                third_party_id=temp_user.third_party_id,
                role=user_invite.role,
            )
            user_invite.delete()
    except IntegrityError as e:
        new_user = None

    return new_user


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
