from rest_framework.exceptions import NotFound, PermissionDenied

from .models import User, UserInvite
from .logic import get_user_invites, get_users


def check_requester_user_invite_same_organization(view_method):
    def _arguments_wrapper(
        instance, request, requester: User, user_invite_id: int, *args, **kwargs
    ):
        try:
            user_invite = (
                get_user_invites(id=user_invite_id).select_related("organization").get()
            )

            if user_invite.organization != requester.organization:
                raise PermissionDenied(
                    detail="Requester and user invite are in different organizations.",
                    code="wrong_organization",
                )

        except (
            UserInvite.DoesNotExist,
            PermissionDenied,
        ) as e:
            raise NotFound(detail="No user invite found.", code="no_user_invite_found")

        return view_method(
            instance,
            request,
            requester=requester,
            user_invite=user_invite,
            *args,
            **kwargs
        )

    return _arguments_wrapper


def check_requester_user_same_organization(view_method):
    def _arguments_wrapper(
        instance, request, requester: User, user_id: int, *args, **kwargs
    ):
        try:
            user = (
                get_users(id=user_id)
                .select_related("organization", "profile_image")
                .get()
            )

            if user.organization != requester.organization:
                raise PermissionDenied(
                    detail="Requester and user are in different organizations.",
                    code="wrong_organization",
                )

        except (
            User.DoesNotExist,
            PermissionDenied,
        ) as e:
            raise NotFound(detail="No user found.", code="no_user_found")

        return view_method(
            instance, request, requester=requester, user=user, *args, **kwargs
        )

    return _arguments_wrapper
