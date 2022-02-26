from typing import Optional

from django.utils.crypto import get_random_string
from django.db import transaction

from rest_framework_simplejwt.tokens import RefreshToken

from treeckle.common.constants import REFRESH, ACCESS, TOKENS, USER

from users.models import User
from users.logic import requester_to_json
from .models import PasswordAuthentication, PasswordAuthenticationData


def get_tokens(user: User) -> dict:
    refreshToken = RefreshToken.for_user(user)

    return {
        REFRESH: str(refreshToken),
        ACCESS: str(refreshToken.access_token),
    }


def get_authenticated_data(user: User) -> dict:
    data = requester_to_json(user)
    tokens = get_tokens(user)

    return {USER: data, TOKENS: tokens}


@transaction.atomic
def reset_password(user: User) -> Optional[str]:
    random_password = get_random_string(length=8)

    PasswordAuthentication.objects.filter(user=user).delete()

    ## try to create new password auth method for user
    password_authentication = PasswordAuthentication.create(
        user=user,
        auth_data=PasswordAuthenticationData(
            name="", email="", auth_id=random_password
        ),
        check_alt_methods=False,
    )

    return random_password if password_authentication is not None else None
