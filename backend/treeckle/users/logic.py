from typing import Sequence, Iterable

from django.db.models import QuerySet

from treeckle.common.constants import (
    ID,
    NAME,
    EMAIL,
    ORGANIZATION,
    ROLE,
    CREATED_AT,
    UPDATED_AT,
    PROFILE_IMAGE,
)
from treeckle.common.parsers import parse_datetime_to_ms_timestamp
from organizations.models import Organization
from .models import User, UserInvite


def user_to_json(user: User) -> dict:
    return {
        ID: user.id,
        NAME: user.name,
        EMAIL: user.email,
        ORGANIZATION: user.organization.name,
        ROLE: user.role,
        PROFILE_IMAGE: user.profile_image,
        CREATED_AT: parse_datetime_to_ms_timestamp(user.created_at),
        UPDATED_AT: parse_datetime_to_ms_timestamp(user.updated_at),
    }


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
