from rest_framework_simplejwt.tokens import RefreshToken

from users.models import User, UserInvite
from users.logic import user_to_json, get_users, get_user_invites
from treeckle.common.constants import REFRESH, ACCESS, NAME, EMAIL


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


def get_login_details(email: str) -> dict:
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

    return None
