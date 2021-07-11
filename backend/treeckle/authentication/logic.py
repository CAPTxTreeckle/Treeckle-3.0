from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User
from users.logic import user_to_json
from treeckle.common.constants import REFRESH, ACCESS


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
