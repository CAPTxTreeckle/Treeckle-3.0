from typing import Sequence, Iterable

from django.db.models import QuerySet
from django.db import transaction

from treeckle.common.exceptions import InternalServerError
from treeckle.common.constants import (
    ID,
    NAME,
    EMAIL,
    ORGANIZATION,
    ROLE,
    CREATED_AT,
    UPDATED_AT,
    PROFILE_IMAGE,
    IS_SELF,
    HAS_PASSWORD_AUTH,
    HAS_GOOGLE_AUTH,
    HAS_FACEBOOK_AUTH,
)
from treeckle.common.parsers import parse_datetime_to_ms_timestamp
from organizations.models import Organization
from authentication.models import PasswordAuthentication, GoogleAuthentication
from .models import User, UserInvite


def user_to_json(user: User, requester: User = None) -> dict:
    data = {
        ID: user.id,
        NAME: user.name,
        EMAIL: user.email,
        ORGANIZATION: user.organization.name,
        ROLE: user.role,
        PROFILE_IMAGE: user.profile_image,
        CREATED_AT: parse_datetime_to_ms_timestamp(user.created_at),
        UPDATED_AT: parse_datetime_to_ms_timestamp(user.updated_at),
    }

    if requester is not None:
        data.update({IS_SELF: user == requester})

    return data


def requester_to_json(requester: User) -> dict:
    data = user_to_json(user=requester, requester=requester)

    data.update(
        {
            HAS_PASSWORD_AUTH: hasattr(
                requester, PasswordAuthentication.get_related_name()
            ),
            HAS_GOOGLE_AUTH: hasattr(
                requester, GoogleAuthentication.get_related_name()
            ),
            HAS_FACEBOOK_AUTH: False,
        }
    )

    return data


def user_invite_to_json(user_invite: UserInvite) -> dict:
    return {
        ID: user_invite.id,
        EMAIL: user_invite.email,
        ROLE: user_invite.role,
        ORGANIZATION: user_invite.organization.name,
        CREATED_AT: parse_datetime_to_ms_timestamp(user_invite.created_at),
        UPDATED_AT: parse_datetime_to_ms_timestamp(user_invite.updated_at),
    }


def get_users(*args, **kwargs) -> QuerySet[User]:
    return User.objects.filter(*args, **kwargs)


def get_user_invites(*args, **kwargs) -> QuerySet[UserInvite]:
    return UserInvite.objects.filter(*args, **kwargs)


def get_valid_invitations(invitations: dict) -> Sequence[tuple[str, str]]:
    existing_user_emails = User.objects.values_list("email", flat=True)
    existing_user_invite_emails = UserInvite.objects.values_list("email", flat=True)

    existing_emails_set = set(existing_user_emails) | set(existing_user_invite_emails)

    valid_invitations = [
        (invitation["email"].lower(), invitation["role"])
        for invitation in invitations
        if invitation["email"].lower() not in existing_emails_set
    ]

    return valid_invitations


def create_user_invites(
    valid_invitations: Iterable[tuple[str, str]], organization: Organization
) -> Sequence[UserInvite]:
    user_invites_to_be_created = (
        UserInvite(organization=organization, email=email, role=role)
        for email, role in valid_invitations
    )
    new_user_invites = UserInvite.objects.bulk_create(user_invites_to_be_created)

    return new_user_invites


@transaction.atomic
def update_requester(requester: User, password: str) -> User:
    PasswordAuthentication.objects.filter(user=requester).delete()

    ## try to create new auth method for user
    new_password_auth = PasswordAuthentication.create(
        user=requester, password=password, check_alt_methods=False
    )

    if new_password_auth is None:
        raise InternalServerError(
            detail="An error has occurred while updating the password.",
            code="no_new_password_auth",
        )

    return requester
