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


def update_user_invites(
    user_invite_data_dict: dict, organization: Organization
) -> Sequence[UserInvite]:
    user_invite_ids_to_be_updated = user_invite_data_dict.keys()
    user_invites_to_be_updated = [
        user_invite
        for user_invite in get_user_invites(
            id__in=user_invite_ids_to_be_updated,
            organization=organization,
        )
    ]

    ## https://pypi.org/project/django-update-from-dict/
    for user_invite in user_invites_to_be_updated:
        user_invite.update_from_dict(
            user_invite_data_dict[user_invite.id], commit=False
        )

    UserInvite.objects.bulk_update(
        user_invites_to_be_updated,
        fields=["role"],
    )

    return user_invites_to_be_updated


def update_users(user_data_dict: dict, organization: Organization) -> Sequence[User]:
    user_ids_to_be_updated = user_data_dict.keys()
    users_to_be_updated = [
        user
        for user in get_users(
            id__in=user_ids_to_be_updated,
            organization=organization,
        ).select_related("organization")
    ]

    ## https://pypi.org/project/django-update-from-dict/
    for user in users_to_be_updated:
        user.update_from_dict(user_data_dict[user.id], commit=False)

    User.objects.bulk_update(users_to_be_updated, fields=["name", "email", "role"])

    return users_to_be_updated


def delete_user_invites(
    emails_to_be_deleted: Iterable[str], organization: Organization
) -> Sequence[str]:
    user_invites_to_be_deleted = get_user_invites(
        email__in=emails_to_be_deleted,
        organization=organization,
    )

    deleted_emails = [user_invite.email for user_invite in user_invites_to_be_deleted]
    user_invites_to_be_deleted.delete()

    return deleted_emails


def delete_users(
    emails_to_be_deleted: Iterable[str], organization: Organization
) -> Sequence[str]:
    users_to_be_deleted = get_users(
        email__in=emails_to_be_deleted,
        organization=organization,
    )

    deleted_emails = [user.email for user in users_to_be_deleted]
    users_to_be_deleted.delete()

    return deleted_emails


def sanitize_and_convert_data_list_to_dict(
    data_list: Iterable[dict],
    key_name: str,
    fields: Iterable[str],
) -> dict:
    fields_set = set(fields)

    return {
        data[key_name]: {
            field: field_value
            for field, field_value in data.items()
            if field in fields_set
        }
        for data in data_list
        if key_name in data
    }
