import os
import requests

from typing import Sequence, Iterable, Optional

from django.db.models import QuerySet
from django.db import transaction, models

from treeckle.common.exceptions import InternalServerError, BadRequest
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
    GOOGLE_AUTH,
    FACEBOOK_AUTH,
)
from treeckle.common.parsers import parse_datetime_to_ms_timestamp
from organizations.models import Organization
from authentication.models import (
    PasswordAuthentication,
    GoogleAuthentication,
    FacebookAuthentication,
)
from content_delivery_service.models import Image
from .models import User, UserInvite, PatchUserAction


def user_to_json(user: User, requester: User = None) -> dict:
    data = {
        ID: user.id,
        NAME: user.name,
        EMAIL: user.email,
        ORGANIZATION: user.organization.name,
        ROLE: user.role,
        PROFILE_IMAGE: None
        if user.profile_image is None
        else user.profile_image.image_url,
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
            GOOGLE_AUTH: {
                EMAIL: requester.googleauthentication.email,
                PROFILE_IMAGE: requester.googleauthentication.profile_image,
            }
            if hasattr(requester, GoogleAuthentication.get_related_name())
            else None,
            FACEBOOK_AUTH: {
                EMAIL: requester.facebookauthentication.email,
                PROFILE_IMAGE: requester.facebookauthentication.profile_image,
            }
            if hasattr(requester, FacebookAuthentication.get_related_name())
            else None,
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


FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET")


@transaction.atomic
def update_requester(
    requester: User, action: PatchUserAction, payload: Optional[dict]
) -> User:
    ## lazy import to prevent circular import
    from .utils import ActionClasses

    classes = ActionClasses.get(action)

    if not classes:
        raise BadRequest(detail="Invalid action.", code="invalid_patch_user_action")

    serializer_class = classes.serializer_class

    if action == PatchUserAction.NAME:
        serializer = serializer_class(data=payload)
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data.get("name")

        requester.name = name
        requester.save()

        return requester

    if action == PatchUserAction.PROFILE_IMAGE:
        if payload is None:
            old_profile_image = requester.profile_image
            requester.profile_image = None

            requester.save()

            ## only delete if requester can be updated successfully
            if old_profile_image:
                old_profile_image.delete()

            return requester

        serializer = serializer_class(data=payload)
        serializer.is_valid(raise_exception=True)

        image_data = serializer.validated_data.get("profile_image")

        if requester.profile_image:
            ## make a copy so that we can delete image from server after all db operations
            old_profile_image = requester.profile_image.copy()
            profile_image = requester.profile_image
        else:
            old_profile_image = None
            profile_image = Image()

        profile_image.organization = requester.organization
        profile_image.image_url = image_data

        ## need to upload to server first before saving
        ## so that image_id can be retrieved and stored
        profile_image.upload_image_to_server()

        profile_image.save()

        requester.profile_image = profile_image

        requester.save()

        if old_profile_image:
            old_profile_image.delete_image_from_server()

        return requester

    ## for auth actions
    auth_method_class = classes.auth_method_class
    auth_name = classes.auth_name

    if action == PatchUserAction.PASSWORD:
        ## Do not allow None / user to delete password
        serializer = serializer_class(data=payload)
        serializer.is_valid(raise_exception=True)

        password_auth_data = serializer.validated_data

        auth_method_class.objects.filter(user=requester).delete()

        ## try to create new password auth method for user
        new_auth_method = auth_method_class.create(
            user=requester,
            auth_data=password_auth_data,
            check_alt_methods=False,
        )

        if new_auth_method is None:
            raise InternalServerError(
                detail=f"An error has occurred while updating the {auth_name}.",
                code=f"no_new_{auth_name}_auth",
            )

    elif action in (PatchUserAction.GOOGLE, PatchUserAction.FACEBOOK):
        if payload is None:
            try:
                auth_method = auth_method_class.objects.get(user=requester)
            except auth_method_class.DoesNotExist as e:
                raise BadRequest(
                    detail=f"There is no {auth_name} account that is currently linked.",
                    code=f"no_linked_{auth_name}_account",
                )

            auth_method.delete()

            if action == PatchUserAction.FACEBOOK:
                response = requests.delete(
                    f"https://graph.facebook.com/v11.0/{auth_method.auth_id}/permissions",
                    params={"access_token": f"{FACEBOOK_APP_ID}|{FACEBOOK_APP_SECRET}"},
                )

                if not response.json().get("success"):
                    raise InternalServerError(
                        detail="An error has occurred while unlinking {auth_name} account."
                    )

        else:
            if auth_method_class.objects.filter(user=requester).exists():
                raise BadRequest(
                    detail=f"There is already a linked {auth_name} account.",
                    code=f"linked_{auth_name}_account_exists",
                )

            serializer = serializer_class(data=payload)
            serializer.is_valid(raise_exception=True)

            auth_data = serializer.validated_data

            if auth_method_class.objects.filter(auth_id=auth_data.auth_id).exists():
                raise BadRequest(
                    detail=f"{auth_name.capitalize()} account is already linked to another Treeckle account.",
                    code=f"{auth_name}_account_linked_to_other_treeckle_account",
                )

            ## try to create new auth method for user
            new_auth_method = auth_method_class.create(
                user=requester, auth_data=auth_data
            )

            if new_auth_method is None:
                raise InternalServerError(
                    detail=f"An error has occurred while linking the {auth_name} account.",
                    code=f"no_new_{auth_name}_auth",
                )

    return requester
